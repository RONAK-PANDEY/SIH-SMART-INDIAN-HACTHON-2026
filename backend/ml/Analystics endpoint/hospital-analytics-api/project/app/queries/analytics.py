"""
SQL aggregation queries backing /api/v1/analytics/*.

Each query is a plain parameterized SQL string (PostgreSQL dialect), executed
via SQLAlchemy's `text()` in the router layer. Keeping them here (rather than
inline in the route functions) makes each query independently readable,
diffable, and unit-testable against a real database.

All queries accept:
    :start_date, :end_date   -- date (inclusive range)
    :department_id           -- int or NULL (no filter)
Some also accept:
    :doctor_id                -- int or NULL (no filter)

NULL-able filters use the `(:param::int IS NULL OR col = :param)` pattern so
a single query serves both the filtered and unfiltered case.
"""

SUMMARY_STATS = """
SELECT
    COUNT(*)                                                      AS total_appointments,
    COUNT(*) FILTER (WHERE status = 'completed')                  AS completed,
    COUNT(*) FILTER (WHERE status = 'cancelled')                  AS cancelled,
    COUNT(*) FILTER (WHERE status = 'no_show')                    AS no_show,
    COUNT(*) FILTER (WHERE status IN ('scheduled', 'checked_in', 'in_progress'))
                                                                   AS in_progress_or_scheduled,
    COUNT(DISTINCT patient_id)                                    AS unique_patients,
    ROUND(
        AVG(EXTRACT(EPOCH FROM (consult_start_time - check_in_time)) / 60.0)
            FILTER (WHERE consult_start_time IS NOT NULL AND check_in_time IS NOT NULL)
    ::numeric, 1)                                                 AS avg_wait_time_minutes,
    ROUND(
        AVG(EXTRACT(EPOCH FROM (consult_end_time - consult_start_time)) / 60.0)
            FILTER (WHERE consult_end_time IS NOT NULL AND consult_start_time IS NOT NULL)
    ::numeric, 1)                                                 AS avg_consult_duration_minutes,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*), 0)
    ::numeric, 1)                                                 AS completion_rate_pct
FROM appointments
WHERE scheduled_at::date BETWEEN :start_date AND :end_date
  AND (:department_id::int IS NULL OR department_id = :department_id);
"""

PATIENTS_PER_HOUR = """
SELECT
    EXTRACT(HOUR FROM check_in_time)::int AS hour,
    COUNT(*)                              AS patient_count,
    ROUND(
        AVG(EXTRACT(EPOCH FROM (consult_start_time - check_in_time)) / 60.0)
            FILTER (WHERE consult_start_time IS NOT NULL)
    ::numeric, 1)                         AS avg_wait_time_minutes
FROM appointments
WHERE check_in_time IS NOT NULL
  AND check_in_time::date BETWEEN :start_date AND :end_date
  AND (:department_id::int IS NULL OR department_id = :department_id)
GROUP BY 1
ORDER BY 1;
"""

DEPARTMENT_WAIT_TIMES = """
SELECT
    d.id                                                              AS department_id,
    d.name                                                            AS department_name,
    COUNT(a.id)                                                       AS patient_count,
    ROUND(AVG(
        EXTRACT(EPOCH FROM (a.consult_start_time - a.check_in_time)) / 60.0
    )::numeric, 1)                                                    AS avg_wait_time_minutes,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY EXTRACT(EPOCH FROM (a.consult_start_time - a.check_in_time)) / 60.0
    )::numeric, 1)                                                    AS median_wait_time_minutes,
    ROUND(PERCENTILE_CONT(0.9) WITHIN GROUP (
        ORDER BY EXTRACT(EPOCH FROM (a.consult_start_time - a.check_in_time)) / 60.0
    )::numeric, 1)                                                    AS p90_wait_time_minutes
FROM appointments a
JOIN departments d ON d.id = a.department_id
WHERE a.check_in_time IS NOT NULL
  AND a.consult_start_time IS NOT NULL
  AND a.scheduled_at::date BETWEEN :start_date AND :end_date
  AND (:department_id::int IS NULL OR a.department_id = :department_id)
GROUP BY d.id, d.name
ORDER BY avg_wait_time_minutes DESC NULLS LAST;
"""

# Doctor capacity (in 'slots') is derived by expanding each doctor's weekly
# recurring schedule across every calendar date in the window whose
# ISO day-of-week matches, then dividing each shift's length by its slot size.
HOSPITAL_PERFORMANCE = """
WITH date_range AS (
    SELECT generate_series(:start_date::date, :end_date::date, interval '1 day')::date AS the_date
),
capacity AS (
    SELECT SUM(
        (EXTRACT(EPOCH FROM (ds.end_time - ds.start_time)) / 60.0) / ds.slot_duration_minutes
    ) AS capacity_slots
    FROM date_range dr
    JOIN doctor_schedules ds ON ds.day_of_week = EXTRACT(ISODOW FROM dr.the_date)
    JOIN doctors doc ON doc.id = ds.doctor_id AND doc.is_active
    WHERE (:department_id::int IS NULL OR doc.department_id = :department_id)
),
appts AS (
    SELECT *
    FROM appointments
    WHERE scheduled_at::date BETWEEN :start_date AND :end_date
      AND (:department_id::int IS NULL OR department_id = :department_id)
),
perf AS (
    SELECT
        ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed')
              / NULLIF(COUNT(*), 0)::numeric, 1)                       AS completion_rate_pct,
        ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'no_show')
              / NULLIF(COUNT(*), 0)::numeric, 1)                       AS no_show_rate_pct,
        ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'cancelled')
              / NULLIF(COUNT(*), 0)::numeric, 1)                       AS cancellation_rate_pct,
        ROUND(100.0 * COUNT(*) FILTER (
                  WHERE consult_start_time IS NOT NULL
                    AND consult_start_time <= scheduled_at + interval '10 minutes')
              / NULLIF(COUNT(*) FILTER (WHERE consult_start_time IS NOT NULL), 0)::numeric, 1)
                                                                         AS on_time_rate_pct,
        ROUND(100.0 * COUNT(*) FILTER (WHERE status IN ('completed', 'in_progress', 'checked_in'))
              / NULLIF((SELECT capacity_slots FROM capacity), 0)::numeric, 1)
                                                                         AS doctor_utilization_pct
    FROM appts
)
SELECT
    completion_rate_pct,
    no_show_rate_pct,
    cancellation_rate_pct,
    on_time_rate_pct,
    doctor_utilization_pct,
    ROUND(
        (COALESCE(completion_rate_pct, 0)
         + COALESCE(on_time_rate_pct, 0)
         + COALESCE(doctor_utilization_pct, 0)) / 3.0
    , 1) AS overall_performance_pct
FROM perf;
"""

DOCTOR_AVAILABILITY = """
WITH date_range AS (
    SELECT generate_series(:start_date::date, :end_date::date, interval '1 day')::date AS the_date
),
capacity AS (
    SELECT ds.doctor_id,
           SUM(
               (EXTRACT(EPOCH FROM (ds.end_time - ds.start_time)) / 60.0) / ds.slot_duration_minutes
           ) AS capacity_slots
    FROM date_range dr
    JOIN doctor_schedules ds ON ds.day_of_week = EXTRACT(ISODOW FROM dr.the_date)
    GROUP BY ds.doctor_id
),
booked AS (
    SELECT doctor_id,
           COUNT(*)                                        AS booked_appointments,
           COUNT(*) FILTER (WHERE status = 'completed')     AS completed_appointments
    FROM appointments
    WHERE scheduled_at::date BETWEEN :start_date AND :end_date
      AND status != 'cancelled'
    GROUP BY doctor_id
)
SELECT
    doc.id                                                              AS doctor_id,
    doc.full_name                                                       AS doctor_name,
    dep.name                                                            AS department_name,
    COALESCE(cap.capacity_slots, 0)::int                                AS capacity_slots,
    COALESCE(b.booked_appointments, 0)                                  AS booked_appointments,
    COALESCE(b.completed_appointments, 0)                               AS completed_appointments,
    ROUND(100.0 * COALESCE(b.booked_appointments, 0)
          / NULLIF(cap.capacity_slots, 0)::numeric, 1)                  AS utilization_pct,
    GREATEST(COALESCE(cap.capacity_slots, 0)::int - COALESCE(b.booked_appointments, 0), 0)
                                                                         AS available_slots
FROM doctors doc
JOIN departments dep ON dep.id = doc.department_id
LEFT JOIN capacity cap ON cap.doctor_id = doc.id
LEFT JOIN booked b ON b.doctor_id = doc.id
WHERE doc.is_active
  AND (:department_id::int IS NULL OR doc.department_id = :department_id)
  AND (:doctor_id::int IS NULL OR doc.id = :doctor_id)
ORDER BY utilization_pct DESC NULLS LAST;
"""

PEAK_HOURS = """
SELECT
    EXTRACT(ISODOW FROM check_in_time)::int AS iso_dow,
    CASE EXTRACT(ISODOW FROM check_in_time)::int
        WHEN 1 THEN 'Monday'    WHEN 2 THEN 'Tuesday'  WHEN 3 THEN 'Wednesday'
        WHEN 4 THEN 'Thursday'  WHEN 5 THEN 'Friday'   WHEN 6 THEN 'Saturday'
        WHEN 7 THEN 'Sunday'
    END                                      AS day_of_week,
    EXTRACT(HOUR FROM check_in_time)::int    AS hour,
    COUNT(*)                                 AS patient_count
FROM appointments
WHERE check_in_time IS NOT NULL
  AND check_in_time::date BETWEEN :start_date AND :end_date
  AND (:department_id::int IS NULL OR department_id = :department_id)
GROUP BY 1, 2, 3
ORDER BY patient_count DESC;
"""
