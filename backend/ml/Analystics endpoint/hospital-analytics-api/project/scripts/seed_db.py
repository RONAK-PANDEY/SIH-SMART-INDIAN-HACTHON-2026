"""
Creates the schema (db/schema.sql) and populates it with synthetic data so
the analytics endpoints have something to aggregate over.

Usage:
    DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/hospital \
        python scripts/seed_db.py [--days 14] [--patients 600]
"""

import argparse
import asyncio
import random
from datetime import datetime, timedelta, time

from faker import Faker
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import DATABASE_URL  # noqa: E402

fake = Faker()

DEPARTMENTS = [
    ("General Medicine", "GEN"),
    ("Cardiology", "CARD"),
    ("Orthopedics", "ORTHO"),
    ("Pediatrics", "PED"),
    ("Dermatology", "DERM"),
    ("ENT", "ENT"),
    ("Gynecology", "GYN"),
    ("Ophthalmology", "OPHTH"),
]

STATUS_WEIGHTS = [
    ("completed", 0.72),
    ("no_show", 0.08),
    ("cancelled", 0.07),
    ("checked_in", 0.05),
    ("in_progress", 0.03),
    ("scheduled", 0.05),
]


async def create_schema(conn):
    schema_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "db", "schema.sql")
    with open(schema_path) as f:
        ddl = f.read()
    # Split on semicolons at statement boundaries; schema.sql has no semicolons
    # inside string literals so a naive split is safe here.
    for statement in ddl.split(";"):
        statement = statement.strip()
        if statement:
            await conn.execute(text(statement))


async def seed_departments(conn) -> list[int]:
    ids = []
    for name, code in DEPARTMENTS:
        result = await conn.execute(
            text("INSERT INTO departments (name, code) VALUES (:n, :c) RETURNING id"),
            {"n": name, "c": code},
        )
        ids.append(result.scalar_one())
    return ids


async def seed_doctors_and_schedules(conn, department_ids: list[int]) -> list[dict]:
    doctors = []
    for dept_id in department_ids:
        for _ in range(random.randint(2, 4)):
            result = await conn.execute(
                text(
                    "INSERT INTO doctors (full_name, department_id, specialization, is_active) "
                    "VALUES (:n, :d, :s, TRUE) RETURNING id"
                ),
                {
                    "n": f"Dr. {fake.last_name()}",
                    "d": dept_id,
                    "s": fake.job()[:40],
                },
            )
            doctor_id = result.scalar_one()
            doctors.append({"id": doctor_id, "department_id": dept_id})

            # Mon-Fri 9:00-17:00, Saturday 9:00-13:00, 15-min slots.
            for dow in range(1, 6):
                await conn.execute(
                    text(
                        "INSERT INTO doctor_schedules "
                        "(doctor_id, day_of_week, start_time, end_time, slot_duration_minutes) "
                        "VALUES (:doc, :dow, :st, :et, 15)"
                    ),
                    {"doc": doctor_id, "dow": dow, "st": time(9, 0), "et": time(17, 0)},
                )
            if random.random() < 0.6:
                await conn.execute(
                    text(
                        "INSERT INTO doctor_schedules "
                        "(doctor_id, day_of_week, start_time, end_time, slot_duration_minutes) "
                        "VALUES (:doc, 6, :st, :et, 15)"
                    ),
                    {"doc": doctor_id, "st": time(9, 0), "et": time(13, 0)},
                )
    return doctors


async def seed_patients(conn, n: int) -> list[int]:
    ids = []
    for _ in range(n):
        result = await conn.execute(
            text(
                "INSERT INTO patients (full_name, date_of_birth, gender, phone, created_at) "
                "VALUES (:n, :dob, :g, :p, now()) RETURNING id"
            ),
            {
                "n": fake.name(),
                "dob": fake.date_of_birth(minimum_age=1, maximum_age=90),
                "g": random.choice(["male", "female", "other"]),
                "p": fake.phone_number()[:20],
            },
        )
        ids.append(result.scalar_one())
    return ids


def pick_status() -> str:
    r = random.random()
    cum = 0.0
    for status, weight in STATUS_WEIGHTS:
        cum += weight
        if r <= cum:
            return status
    return "completed"


async def seed_appointments(conn, doctors: list[dict], patient_ids: list[int], days: int):
    today = datetime.now().date()
    for day_offset in range(days, -1, -1):
        the_date = today - timedelta(days=day_offset)
        if the_date.weekday() == 6:  # skip Sundays (closed)
            continue
        # More load on weekdays, morning/midday peak.
        n_appts = random.randint(40, 90) if the_date.weekday() < 5 else random.randint(15, 35)
        for _ in range(n_appts):
            doctor = random.choice(doctors)
            patient_id = random.choice(patient_ids)
            hour = random.choices(
                population=list(range(8, 18)),
                weights=[2, 5, 8, 9, 7, 4, 3, 6, 8, 5],  # peak ~10-11am, dip at lunch
                k=1,
            )[0]
            minute = random.choice([0, 15, 30, 45])
            scheduled_at = datetime.combine(the_date, time(hour, minute))

            status = pick_status()
            check_in = consult_start = consult_end = None

            if status != "scheduled":
                check_in = scheduled_at + timedelta(minutes=random.randint(-5, 20))
            if status in ("checked_in", "in_progress", "completed"):
                wait = max(0, int(random.gauss(18, 12)))
                consult_start = check_in + timedelta(minutes=wait) if check_in else None
            if status in ("in_progress", "completed") and consult_start:
                consult_end = consult_start + timedelta(minutes=max(3, int(random.gauss(12, 5))))

            await conn.execute(
                text(
                    "INSERT INTO appointments "
                    "(patient_id, doctor_id, department_id, scheduled_at, check_in_time, "
                    " consult_start_time, consult_end_time, status, created_at) "
                    "VALUES (:pid, :did, :dep, :sched, :ci, :cs, :ce, :st, now())"
                ),
                {
                    "pid": patient_id,
                    "did": doctor["id"],
                    "dep": doctor["department_id"],
                    "sched": scheduled_at,
                    "ci": check_in,
                    "cs": consult_start,
                    "ce": consult_end,
                    "st": status,
                },
            )


async def main(days: int, n_patients: int):
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        await create_schema(conn)
        dept_ids = await seed_departments(conn)
        doctors = await seed_doctors_and_schedules(conn, dept_ids)
        patient_ids = await seed_patients(conn, n_patients)
        await seed_appointments(conn, doctors, patient_ids, days)
    await engine.dispose()
    print(f"Seeded {len(dept_ids)} departments, {len(doctors)} doctors, "
          f"{len(patient_ids)} patients, ~{days} days of appointments.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--days", type=int, default=14)
    parser.add_argument("--patients", type=int, default=600)
    args = parser.parse_args()
    asyncio.run(main(args.days, args.patients))
