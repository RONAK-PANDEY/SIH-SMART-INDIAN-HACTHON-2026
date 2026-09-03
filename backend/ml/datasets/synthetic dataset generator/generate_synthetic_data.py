"""
generate_synthetic_data.py

Generates a realistic synthetic dataset for a multi-hospital appointment/queue
system, matching backend/db/schema.sql:

    users, hospitals, departments, doctors, doctor_availability, patients,
    appointments, queue_tokens, wait_time_history

Output:
    Writes one CSV per table to the given output directory, plus a single
    combined SQLite database (synthetic_data.db) for convenience so the
    demo seed script and ML training scripts can each consume whichever
    format is easiest.

Design notes (what makes this "realistic" rather than uniform-random):
    - Each hospital has 5-6 departments; each department has a baseline
      consult duration (e.g. ER is fast, Cardiology is slower).
    - Each doctor has a personal pace (avg_consult_minutes) and a
      punctuality_factor: some doctors chronically run behind schedule.
    - Doctors only have appointments during their weekly availability
      windows (doctor_availability), with slot granularity per doctor.
    - Demand follows realistic daily/weekly patterns: busier on weekdays,
      busiest mid-morning and mid-afternoon, near-empty at day open/close.
    - Queue length and doctor backlog build up through the day (later
      patients see longer queues and more accumulated doctor delay),
      then partially reset overnight.
    - actual_wait_minutes is generated as a function of queue length,
      doctor backlog, department baseline, and doctor punctuality, plus
      noise -- not pure randomness -- so it's learnable by an ML model.
    - A small fraction of appointments are walk-ins, no-shows, or
      cancellations, as in a real system.

Usage:
    python generate_synthetic_data.py \
        --output-dir ./output \
        --num-hospitals 3 \
        --min-patients 100 --max-patients 500 \
        --days-history 90 \
        --seed 42
"""

from __future__ import annotations

import argparse
import csv
import os
import random
import sqlite3
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta, time as dtime
from typing import Optional

# ----------------------------------------------------------------------------
# Reference data
# ----------------------------------------------------------------------------

DEPARTMENT_CATALOG = [
    # name, baseline consult minutes, relative demand weight
    ("General Medicine", 12, 1.4),
    ("Cardiology", 22, 0.9),
    ("Orthopedics", 18, 0.8),
    ("Pediatrics", 14, 1.1),
    ("Dermatology", 10, 0.7),
    ("ENT", 13, 0.6),
    ("Gynecology", 16, 0.7),
]

HOSPITAL_NAME_POOL = [
    "St. Mary's General Hospital",
    "Riverside Medical Center",
    "Lakeview Community Hospital",
    "Northside Regional Hospital",
    "Sunrise Multispecialty Hospital",
]

FIRST_NAMES = [
    "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael",
    "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan",
    "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Aditi",
    "Rohan", "Priya", "Arjun", "Neha", "Vikram", "Ananya", "Rahul", "Kavya",
    "Sanjay", "Fatima", "Ahmed", "Layla", "Omar", "Wei", "Mei", "Chen",
    "Yuki", "Hiro", "Carlos", "Sofia", "Diego", "Valentina",
]
LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Rodriguez", "Martinez", "Sharma", "Patel", "Gupta", "Kumar",
    "Singh", "Khan", "Ali", "Chen", "Wang", "Li", "Kim", "Park", "Nguyen",
    "Tran", "Silva", "Costa", "Rossi", "Muller", "Novak", "Ivanov",
]

SPECIALIZATIONS = {
    "General Medicine": ["Internal Medicine", "Family Medicine"],
    "Cardiology": ["Interventional Cardiology", "Cardiac Electrophysiology", "General Cardiology"],
    "Orthopedics": ["Sports Medicine", "Joint Replacement", "Spine Surgery"],
    "Pediatrics": ["General Pediatrics", "Neonatology"],
    "Dermatology": ["Cosmetic Dermatology", "Clinical Dermatology"],
    "ENT": ["Otolaryngology", "Head & Neck Surgery"],
    "Gynecology": ["Obstetrics & Gynecology", "Reproductive Health"],
}

APPOINTMENT_STATUSES_WEIGHTS = [
    ("completed", 0.82),
    ("no_show", 0.07),
    ("cancelled", 0.05),
    ("checked_in", 0.03),   # in-progress at "now" snapshot
    ("scheduled", 0.03),    # future, not yet happened
]

GENDERS = ["male", "female", "other"]


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


# ----------------------------------------------------------------------------
# Data classes mirroring schema rows
# ----------------------------------------------------------------------------

@dataclass
class Hospital:
    id: str
    name: str


@dataclass
class Department:
    id: str
    hospital_id: str
    name: str
    floor: str
    avg_consult_minutes: int


@dataclass
class Doctor:
    id: str
    user_id: str
    hospital_id: str
    department_id: str
    name: str
    specialization: str
    years_experience: int
    avg_consult_minutes: int
    punctuality_factor: float
    availability: list = field(default_factory=list)  # list of (dow, start, end, slot_min)


@dataclass
class Patient:
    id: str
    user_id: str
    name: str
    age: int
    gender: str
    home_hospital_id: str


# ----------------------------------------------------------------------------
# Generator
# ----------------------------------------------------------------------------

class SyntheticDataGenerator:
    def __init__(
        self,
        num_hospitals: int = 3,
        min_patients: int = 100,
        max_patients: int = 500,
        min_doctors: int = 10,
        max_doctors: int = 20,
        days_history: int = 90,
        seed: Optional[int] = 42,
    ):
        self.rng = random.Random(seed)
        self.num_hospitals = num_hospitals
        self.total_patients = self.rng.randint(min_patients, max_patients)
        self.total_doctors = self.rng.randint(min_doctors, max_doctors)
        self.days_history = days_history
        self.now = datetime.now().replace(minute=0, second=0, microsecond=0)

        # storage for generated rows
        self.users: list[dict] = []
        self.hospitals: list[Hospital] = []
        self.departments: list[Department] = []
        self.doctors: list[Doctor] = []
        self.doctor_availability: list[dict] = []
        self.patients: list[Patient] = []
        self.appointments: list[dict] = []
        self.queue_tokens: list[dict] = []
        self.wait_time_history: list[dict] = []

    # -- entity generation ---------------------------------------------------

    def gen_users_for(self, count: int) -> list[str]:
        """Create `count` users, return their ids."""
        ids = []
        used_phones = set()
        for _ in range(count):
            uid = new_id("user")
            while True:
                phone = "9" + "".join(str(self.rng.randint(0, 9)) for _ in range(9))
                if phone not in used_phones:
                    used_phones.add(phone)
                    break
            self.users.append({"id": uid, "phone": phone})
            ids.append(uid)
        return ids

    def gen_hospitals(self):
        names = self.rng.sample(HOSPITAL_NAME_POOL, self.num_hospitals)
        for name in names:
            self.hospitals.append(Hospital(id=new_id("hosp"), name=name))

    def gen_departments(self):
        for hosp in self.hospitals:
            n_depts = self.rng.randint(5, 6)
            chosen = self.rng.sample(DEPARTMENT_CATALOG, n_depts)
            for i, (dept_name, base_minutes, _weight) in enumerate(chosen):
                self.departments.append(
                    Department(
                        id=new_id("dept"),
                        hospital_id=hosp.id,
                        name=dept_name,
                        floor=str(self.rng.randint(1, 5)),
                        # small jitter around catalog baseline per hospital
                        avg_consult_minutes=max(5, base_minutes + self.rng.randint(-2, 2)),
                    )
                )

    def gen_doctors(self):
        # distribute total_doctors across departments, ensuring >=1 per dept
        dept_ids = [d.id for d in self.departments]
        n_depts = len(dept_ids)
        doctors_needed = max(self.total_doctors, n_depts)  # ensure coverage

        assigned_dept_for_doctor = []
        # guarantee 1 doctor per department first
        assigned_dept_for_doctor.extend(dept_ids)
        # distribute remainder randomly, weighted toward higher-demand depts
        remaining = doctors_needed - n_depts
        dept_by_id = {d.id: d for d in self.departments}
        weight_lookup = {name: w for name, _b, w in DEPARTMENT_CATALOG}
        weights = [weight_lookup.get(dept_by_id[did].name, 1.0) for did in dept_ids]
        for _ in range(remaining):
            assigned_dept_for_doctor.append(self.rng.choices(dept_ids, weights=weights, k=1)[0])

        user_ids = self.gen_users_for(len(assigned_dept_for_doctor))

        for uid, dept_id in zip(user_ids, assigned_dept_for_doctor):
            dept = dept_by_id[dept_id]
            years_exp = self.rng.randint(1, 35)
            spec_choices = SPECIALIZATIONS.get(dept.name, [dept.name])
            spec = self.rng.choice(spec_choices)

            # doctor's personal pace: jitter around dept baseline,
            # more experienced doctors trend slightly faster
            experience_speedup = max(0, (years_exp - 5)) * 0.05
            personal_pace = dept.avg_consult_minutes - experience_speedup + self.rng.uniform(-3, 3)
            personal_pace = max(6, round(personal_pace))

            # punctuality: most doctors ~1.0, some chronically run behind (>1.2),
            # a few are very disciplined (<0.95)
            punctuality_roll = self.rng.random()
            if punctuality_roll < 0.15:
                punctuality = round(self.rng.uniform(1.25, 1.6), 2)   # chronically late
            elif punctuality_roll < 0.30:
                punctuality = round(self.rng.uniform(0.85, 0.95), 2)  # very punctual
            else:
                punctuality = round(self.rng.uniform(0.95, 1.15), 2)  # typical

            doctor = Doctor(
                id=new_id("doc"),
                user_id=uid,
                hospital_id=dept.hospital_id,
                department_id=dept.id,
                name=f"Dr. {self.rng.choice(FIRST_NAMES)} {self.rng.choice(LAST_NAMES)}",
                specialization=spec,
                years_experience=years_exp,
                avg_consult_minutes=personal_pace,
                punctuality_factor=punctuality,
            )
            self._gen_availability_for(doctor)
            self.doctors.append(doctor)

    def _gen_availability_for(self, doctor: Doctor):
        """Each doctor works a realistic subset of weekdays with 1-2 shifts/day."""
        # pick 4-6 working days out of 7 (Mon=0..Sun=6), weighted away from Sunday
        possible_days = list(range(7))
        day_weights = [1.0, 1.0, 1.0, 1.0, 1.0, 0.6, 0.25]  # Sat/Sun less common
        n_days = self.rng.randint(4, 6)
        work_days = self.rng.choices(
            population=possible_days, weights=day_weights, k=n_days
        )
        work_days = sorted(set(work_days))
        if not work_days:
            work_days = [0, 1, 2, 3, 4]

        for dow in work_days:
            # morning shift
            morning_start = self.rng.choice([8, 9])
            morning_end = morning_start + self.rng.randint(3, 4)
            slot = self.rng.choice([10, 15, 20])
            self.doctor_availability.append({
                "id": new_id("avail"),
                "doctor_id": doctor.id,
                "day_of_week": dow,
                "start_time": f"{morning_start:02d}:00",
                "end_time": f"{morning_end:02d}:00",
                "slot_minutes": slot,
                "is_active": 1,
            })
            doctor.availability.append((dow, morning_start, morning_end, slot))

            # ~60% of doctors also have an afternoon shift that day
            if self.rng.random() < 0.6:
                afternoon_start = self.rng.choice([14, 15])
                afternoon_end = afternoon_start + self.rng.randint(2, 4)
                afternoon_end = min(afternoon_end, 19)
                self.doctor_availability.append({
                    "id": new_id("avail"),
                    "doctor_id": doctor.id,
                    "day_of_week": dow,
                    "start_time": f"{afternoon_start:02d}:00",
                    "end_time": f"{afternoon_end:02d}:00",
                    "slot_minutes": slot,
                    "is_active": 1,
                })
                doctor.availability.append((dow, afternoon_start, afternoon_end, slot))

    def gen_patients(self):
        user_ids = self.gen_users_for(self.total_patients)
        for uid in user_ids:
            home_hosp = self.rng.choice(self.hospitals)
            # age distribution skewed toward adults, with a pediatric tail
            age = int(min(95, max(0, self.rng.gauss(42, 20))))
            self.patients.append(
                Patient(
                    id=new_id("pat"),
                    user_id=uid,
                    name=f"{self.rng.choice(FIRST_NAMES)} {self.rng.choice(LAST_NAMES)}",
                    age=age,
                    gender=self.rng.choice(GENDERS),
                    home_hospital_id=home_hosp.id,
                )
            )

    # -- demand shaping -------------------------------------------------------

    def _hour_demand_weight(self, hour: int) -> float:
        """Bell-curve-ish demand across the day: quiet at open/close, peaks
        mid-morning and mid-afternoon, dip around lunch."""
        peaks = {9: 1.0, 10: 1.3, 11: 1.2, 12: 0.6, 13: 0.5,
                 14: 0.9, 15: 1.2, 16: 1.1, 17: 0.7, 18: 0.4, 8: 0.5}
        return peaks.get(hour, 0.15)

    def _day_demand_weight(self, dow: int) -> float:
        # Mon-Fri busier, Saturday moderate, Sunday quiet
        return [1.15, 1.05, 1.0, 1.0, 1.05, 0.6, 0.25][dow]

    # -- appointment + wait-time generation ------------------------------------

    def gen_appointments_and_waits(self):
        """
        Walk backward from `now` across `days_history` days. For each doctor,
        for each active availability window on each date, generate a
        plausible number of appointment slots filled based on demand weight,
        simulate queue buildup and doctor backlog through the day, and derive
        wait times.
        """
        doctor_by_dept: dict[str, list[Doctor]] = {}
        for doc in self.doctors:
            doctor_by_dept.setdefault(doc.department_id, []).append(doc)

        # index patients by home hospital for locality-biased assignment
        patients_by_hospital: dict[str, list[Patient]] = {}
        for p in self.patients:
            patients_by_hospital.setdefault(p.home_hospital_id, []).append(p)
        all_patients = self.patients

        start_date = (self.now - timedelta(days=self.days_history)).date()
        end_date = self.now.date()

        for doctor in self.doctors:
            if not doctor.availability:
                continue
            dept = next(d for d in self.departments if d.id == doctor.department_id)
            local_patients = patients_by_hospital.get(doctor.hospital_id, []) or all_patients

            date_cursor = start_date
            while date_cursor <= end_date:
                dow = date_cursor.weekday()
                todays_shifts = [a for a in doctor.availability if a[0] == dow]
                for (_dow, start_h, end_h, slot_min) in todays_shifts:
                    self._simulate_shift(
                        doctor=doctor,
                        dept=dept,
                        date_cursor=date_cursor,
                        start_h=start_h,
                        end_h=end_h,
                        slot_min=slot_min,
                        candidate_patients=local_patients,
                    )
                date_cursor += timedelta(days=1)

    def _simulate_shift(
        self,
        doctor: Doctor,
        dept: Department,
        date_cursor,
        start_h: int,
        end_h: int,
        slot_min: int,
        candidate_patients: list[Patient],
    ):
        shift_start = datetime.combine(date_cursor, dtime(hour=start_h))
        shift_end = datetime.combine(date_cursor, dtime(hour=end_h))
        if shift_start > self.now:
            # future shift: create a handful of scheduled (not-yet-happened)
            # appointments only, no wait-time simulation
            future_slots = self._slot_times(shift_start, shift_end, slot_min)
            for slot_time in future_slots:
                if self.rng.random() < 0.4:  # partial future booking
                    self._create_future_appointment(doctor, dept, slot_time, candidate_patients)
            return

        slot_times = self._slot_times(shift_start, shift_end, slot_min)

        # running state through the shift
        doctor_running_late_minutes = 0  # accumulated backlog
        queue_count = 0

        day_w = self._day_demand_weight(date_cursor.weekday())

        for slot_time in slot_times:
            hour_w = self._hour_demand_weight(slot_time.hour)
            fill_prob = min(0.97, 0.55 * day_w * hour_w)
            if self.rng.random() >= fill_prob:
                # slot goes unfilled
                # backlog slightly decays if doctor has a gap
                doctor_running_late_minutes = max(0, doctor_running_late_minutes - self.rng.randint(0, 3))
                continue

            is_walk_in = self.rng.random() < 0.12
            patient = self.rng.choice(candidate_patients)

            appt_id = new_id("appt")
            scheduled_time = slot_time

            status = self._pick_status(scheduled_time)

            # queue length grows through the day, resets a bit after lunch
            queue_count += 1
            if slot_time.hour in (13,):
                queue_count = max(0, queue_count - self.rng.randint(1, 3))

            # patients_ahead varies with queue_count and some noise
            patients_ahead = max(0, queue_count - 1 + self.rng.randint(-1, 1))

            consult_minutes = max(
                4,
                round(self.rng.gauss(doctor.avg_consult_minutes, doctor.avg_consult_minutes * 0.25))
            )

            if status in ("cancelled",):
                self.appointments.append(self._appointment_row(
                    appt_id, patient, doctor, dept, scheduled_time,
                    status, is_walk_in, check_in=None, consult_start=None, consult_end=None
                ))
                continue

            if status == "no_show":
                self.appointments.append(self._appointment_row(
                    appt_id, patient, doctor, dept, scheduled_time,
                    status, is_walk_in, check_in=None, consult_start=None, consult_end=None
                ))
                # doctor doesn't lose time on true no-shows; slight backlog decay
                doctor_running_late_minutes = max(0, doctor_running_late_minutes - self.rng.randint(0, 2))
                continue

            # check-in time: patients typically arrive slightly before/after
            # scheduled time (walk-ins have no "scheduled" concept, so their
            # scheduled_time IS their check-in-ish arrival)
            if is_walk_in:
                check_in = scheduled_time
            else:
                check_in_offset = self.rng.randint(-10, 15)
                check_in = scheduled_time + timedelta(minutes=check_in_offset)

            # --- core wait-time model ---
            # base wait grows with: current queue length, doctor's accumulated
            # backlog, and doctor punctuality factor; department baseline sets
            # scale. Add noise for realism.
            base = dept.avg_consult_minutes * 0.6
            queue_component = queue_count * self.rng.uniform(2.0, 4.0)
            backlog_component = doctor_running_late_minutes * 0.8
            punctuality_component = (doctor.punctuality_factor - 1.0) * 25
            noise = self.rng.gauss(0, 5)

            actual_wait = base + queue_component + backlog_component + punctuality_component + noise
            actual_wait = max(1, round(actual_wait))

            consult_start = check_in + timedelta(minutes=actual_wait)
            consult_end = consult_start + timedelta(minutes=consult_minutes)

            # update doctor's running backlog: if consult ran later than the
            # ideal slot cadence, backlog grows; if doctor caught up, it
            # shrinks (bounded)
            ideal_gap = slot_min
            actual_gap = consult_minutes
            drift = (actual_gap - ideal_gap) * doctor.punctuality_factor
            doctor_running_late_minutes = max(0, min(120, doctor_running_late_minutes + drift * 0.5))

            self.appointments.append(self._appointment_row(
                appt_id, patient, doctor, dept, scheduled_time,
                status, is_walk_in, check_in=check_in,
                consult_start=consult_start, consult_end=consult_end,
            ))

            token_id = new_id("qtok")
            self.queue_tokens.append({
                "id": token_id,
                "token_number": f"{dept.name[:3].upper()}-{queue_count:04d}",
                "appointment_id": appt_id,
                "hospital_id": doctor.hospital_id,
                "department_id": dept.id,
                "doctor_id": doctor.id,
                "issued_at": check_in.isoformat(sep=" "),
                "called_at": consult_start.isoformat(sep=" "),
                "queue_position_at_issue": queue_count,
                "patients_ahead_at_issue": patients_ahead,
            })

            self.wait_time_history.append({
                "id": new_id("wth"),
                "appointment_id": appt_id,
                "hospital_id": doctor.hospital_id,
                "department_id": dept.id,
                "doctor_id": doctor.id,
                "scheduled_time": scheduled_time.isoformat(sep=" "),
                "day_of_week": scheduled_time.weekday(),
                "hour_of_day": scheduled_time.hour,
                "queue_length_at_arrival": patients_ahead,
                "doctor_backlog_minutes": round(doctor_running_late_minutes),
                "actual_wait_minutes": actual_wait,
                "consult_duration_minutes": consult_minutes,
            })

    def _slot_times(self, shift_start: datetime, shift_end: datetime, slot_min: int) -> list[datetime]:
        times = []
        cur = shift_start
        while cur < shift_end:
            times.append(cur)
            cur += timedelta(minutes=slot_min)
        return times

    def _pick_status(self, scheduled_time: datetime) -> str:
        # appointments in the past: draw from completed/no_show/cancelled
        # (checked_in/scheduled reserved for near-"now" edge handled elsewhere)
        names = [s for s, _w in APPOINTMENT_STATUSES_WEIGHTS if s in ("completed", "no_show", "cancelled")]
        weights = [w for s, w in APPOINTMENT_STATUSES_WEIGHTS if s in ("completed", "no_show", "cancelled")]
        return self.rng.choices(names, weights=weights, k=1)[0]

    def _create_future_appointment(self, doctor, dept, slot_time, candidate_patients):
        patient = self.rng.choice(candidate_patients)
        appt_id = new_id("appt")
        self.appointments.append(self._appointment_row(
            appt_id, patient, doctor, dept, slot_time,
            status="scheduled", is_walk_in=False,
            check_in=None, consult_start=None, consult_end=None,
        ))

    def _appointment_row(
        self, appt_id, patient, doctor, dept, scheduled_time,
        status, is_walk_in, check_in, consult_start, consult_end,
    ) -> dict:
        return {
            "id": appt_id,
            "patient_id": patient.id,
            "doctor_id": doctor.id,
            "hospital_id": doctor.hospital_id,
            "department_id": dept.id,
            "scheduled_time": scheduled_time.isoformat(sep=" "),
            "check_in_time": check_in.isoformat(sep=" ") if check_in else None,
            "consult_start_time": consult_start.isoformat(sep=" ") if consult_start else None,
            "consult_end_time": consult_end.isoformat(sep=" ") if consult_end else None,
            "status": status,
            "is_walk_in": int(is_walk_in),
            "day_of_week": scheduled_time.weekday(),
            "hour_of_day": scheduled_time.hour,
        }

    # -- orchestration ---------------------------------------------------------

    def generate(self):
        self.gen_hospitals()
        self.gen_departments()
        self.gen_doctors()
        self.gen_patients()
        self.gen_appointments_and_waits()

    # -- export ------------------------------------------------------------

    def to_dicts(self) -> dict:
        return {
            "users": self.users,
            "hospitals": [h.__dict__ for h in self.hospitals],
            "departments": [d.__dict__ for d in self.departments],
            "doctors": [
                {k: v for k, v in d.__dict__.items() if k != "availability"}
                for d in self.doctors
            ],
            "doctor_availability": self.doctor_availability,
            "patients": [p.__dict__ for p in self.patients],
            "appointments": self.appointments,
            "queue_tokens": self.queue_tokens,
            "wait_time_history": self.wait_time_history,
        }

    def write_csvs(self, output_dir: str):
        os.makedirs(output_dir, exist_ok=True)
        tables = self.to_dicts()
        for table_name, rows in tables.items():
            path = os.path.join(output_dir, f"{table_name}.csv")
            if not rows:
                # still write header-less empty file for consistency
                open(path, "w").close()
                continue
            fieldnames = list(rows[0].keys())
            with open(path, "w", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(rows)
        return {k: len(v) for k, v in tables.items()}

    def write_sqlite(self, db_path: str):
        if os.path.exists(db_path):
            os.remove(db_path)
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()

        cur.executescript("""
        CREATE TABLE users (id TEXT PRIMARY KEY, phone TEXT UNIQUE);
        CREATE TABLE hospitals (id TEXT PRIMARY KEY, name TEXT);
        CREATE TABLE departments (
            id TEXT PRIMARY KEY, hospital_id TEXT, name TEXT,
            floor TEXT, avg_consult_minutes INTEGER
        );
        CREATE TABLE doctors (
            id TEXT PRIMARY KEY, user_id TEXT, hospital_id TEXT, department_id TEXT,
            name TEXT, specialization TEXT, years_experience INTEGER,
            avg_consult_minutes INTEGER, punctuality_factor REAL
        );
        CREATE TABLE doctor_availability (
            id TEXT PRIMARY KEY, doctor_id TEXT, day_of_week INTEGER,
            start_time TEXT, end_time TEXT, slot_minutes INTEGER, is_active INTEGER
        );
        CREATE TABLE patients (
            id TEXT PRIMARY KEY, user_id TEXT, name TEXT, age INTEGER,
            gender TEXT, home_hospital_id TEXT
        );
        CREATE TABLE appointments (
            id TEXT PRIMARY KEY, patient_id TEXT, doctor_id TEXT, hospital_id TEXT,
            department_id TEXT, scheduled_time TEXT, check_in_time TEXT,
            consult_start_time TEXT, consult_end_time TEXT, status TEXT,
            is_walk_in INTEGER, day_of_week INTEGER, hour_of_day INTEGER
        );
        CREATE TABLE queue_tokens (
            id TEXT PRIMARY KEY, token_number TEXT, appointment_id TEXT,
            hospital_id TEXT, department_id TEXT, doctor_id TEXT,
            issued_at TEXT, called_at TEXT,
            queue_position_at_issue INTEGER, patients_ahead_at_issue INTEGER
        );
        CREATE TABLE wait_time_history (
            id TEXT PRIMARY KEY, appointment_id TEXT, hospital_id TEXT,
            department_id TEXT, doctor_id TEXT, scheduled_time TEXT,
            day_of_week INTEGER, hour_of_day INTEGER,
            queue_length_at_arrival INTEGER, doctor_backlog_minutes INTEGER,
            actual_wait_minutes INTEGER, consult_duration_minutes INTEGER
        );
        """)

        tables = self.to_dicts()
        for table_name, rows in tables.items():
            if not rows:
                continue
            cols = list(rows[0].keys())
            placeholders = ", ".join(["?"] * len(cols))
            col_str = ", ".join(cols)
            cur.executemany(
                f"INSERT INTO {table_name} ({col_str}) VALUES ({placeholders})",
                [tuple(row[c] for c in cols) for row in rows],
            )
        conn.commit()
        conn.close()


# ----------------------------------------------------------------------------
# CLI
# ----------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Generate synthetic hospital queue/appointment dataset.")
    parser.add_argument("--output-dir", default="./synthetic_output", help="Directory to write CSVs + sqlite db")
    parser.add_argument("--num-hospitals", type=int, default=3)
    parser.add_argument("--min-patients", type=int, default=100)
    parser.add_argument("--max-patients", type=int, default=500)
    parser.add_argument("--min-doctors", type=int, default=10)
    parser.add_argument("--max-doctors", type=int, default=20)
    parser.add_argument("--days-history", type=int, default=90, help="Days of historical data to simulate")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    gen = SyntheticDataGenerator(
        num_hospitals=args.num_hospitals,
        min_patients=args.min_patients,
        max_patients=args.max_patients,
        min_doctors=args.min_doctors,
        max_doctors=args.max_doctors,
        days_history=args.days_history,
        seed=args.seed,
    )
    gen.generate()

    counts = gen.write_csvs(args.output_dir)
    db_path = os.path.join(args.output_dir, "synthetic_data.db")
    gen.write_sqlite(db_path)

    print("Synthetic data generated:")
    for table, n in counts.items():
        print(f"  {table:22s} {n:>7d} rows")
    print(f"\nCSV files + sqlite db written to: {os.path.abspath(args.output_dir)}")


if __name__ == "__main__":
    main()
