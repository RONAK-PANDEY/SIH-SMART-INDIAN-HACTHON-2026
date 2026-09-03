"""
ORM models mirroring db/schema.sql.

The analytics endpoints themselves query via raw SQL (app/queries/analytics.py)
for full control over aggregation, but these models are used by the seed
script and are available for any future CRUD endpoints.
"""

from datetime import date, datetime, time

from sqlalchemy import CheckConstraint, ForeignKey, SmallInteger, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True)
    code: Mapped[str] = mapped_column(String, unique=True)

    doctors: Mapped[list["Doctor"]] = relationship(back_populates="department")


class Doctor(Base):
    __tablename__ = "doctors"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"))
    specialization: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)

    department: Mapped["Department"] = relationship(back_populates="doctors")
    schedules: Mapped[list["DoctorSchedule"]] = relationship(back_populates="doctor")


class DoctorSchedule(Base):
    __tablename__ = "doctor_schedules"
    __table_args__ = (
        CheckConstraint("day_of_week BETWEEN 1 AND 7", name="ck_day_of_week_range"),
        CheckConstraint("end_time > start_time", name="ck_end_after_start"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id"))
    day_of_week: Mapped[int] = mapped_column(SmallInteger)  # 1=Mon ... 7=Sun (ISODOW)
    start_time: Mapped[time]
    end_time: Mapped[time]
    slot_duration_minutes: Mapped[int] = mapped_column(SmallInteger, default=15)

    doctor: Mapped["Doctor"] = relationship(back_populates="schedules")


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String)
    date_of_birth: Mapped[date | None]
    gender: Mapped[str | None] = mapped_column(String, nullable=True)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime]


class Appointment(Base):
    __tablename__ = "appointments"
    __table_args__ = (
        CheckConstraint(
            "status IN ('scheduled','checked_in','in_progress','completed','cancelled','no_show')",
            name="ck_appointment_status",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"))
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id"))
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"))
    scheduled_at: Mapped[datetime]
    check_in_time: Mapped[datetime | None]
    consult_start_time: Mapped[datetime | None]
    consult_end_time: Mapped[datetime | None]
    status: Mapped[str] = mapped_column(String, default="scheduled")
    created_at: Mapped[datetime]
