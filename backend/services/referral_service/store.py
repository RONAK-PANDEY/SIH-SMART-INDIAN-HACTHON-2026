from __future__ import annotations

import itertools
import threading
from datetime import datetime, timezone

from .models import ReferralRecord

_lock = threading.Lock()
_counter = itertools.count(1)
_referrals: dict[str, ReferralRecord] = {}


def next_referral_id() -> str:
    with _lock:
        n = next(_counter)
    return f"REF-{datetime.now(timezone.utc):%Y%m%d}-{n:05d}"


def save(record: ReferralRecord) -> ReferralRecord:
    with _lock:
        _referrals[record.referral_id] = record
    return record


def get(referral_id: str) -> ReferralRecord | None:
    return _referrals.get(referral_id)


def list_all(facility_id: str | None = None, status: str | None = None) -> list[ReferralRecord]:
    items = list(_referrals.values())
    if facility_id:
        items = [r for r in items if r.from_facility_id == facility_id or r.to_facility_id == facility_id]
    if status:
        items = [r for r in items if r.status == status]
    return sorted(items, key=lambda r: r.created_at, reverse=True)
