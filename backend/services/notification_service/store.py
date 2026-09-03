from __future__ import annotations

import itertools
import threading
from datetime import datetime, timezone

from .models import Notification, NotificationCreate

_lock = threading.Lock()
_counter = itertools.count(1)
_notifications: dict[str, Notification] = {}


def next_notification_id() -> str:
    with _lock:
        n = next(_counter)
    return f"NTF-{n:08d}"


def create(payload: NotificationCreate) -> Notification:
    record = Notification(
        notification_id=next_notification_id(),
        user_id=payload.user_id,
        type=payload.type,
        title=payload.title,
        message=payload.message,
        metadata=payload.metadata,
        is_read=False,
        created_at=datetime.now(timezone.utc),
        read_at=None,
    )
    with _lock:
        _notifications[record.notification_id] = record
    return record


def get(notification_id: str) -> Notification | None:
    return _notifications.get(notification_id)


def list_for_user(user_id: str, unread_only: bool = False) -> list[Notification]:
    items = [n for n in _notifications.values() if n.user_id == user_id]
    if unread_only:
        items = [n for n in items if not n.is_read]
    return sorted(items, key=lambda n: n.created_at, reverse=True)


def mark_read(notification_id: str) -> Notification | None:
    with _lock:
        record = _notifications.get(notification_id)
        if record is None:
            return None
        if not record.is_read:
            record.is_read = True
            record.read_at = datetime.now(timezone.utc)
            _notifications[notification_id] = record
        return record


def mark_all_read(user_id: str) -> int:
    count = 0
    with _lock:
        for record in _notifications.values():
            if record.user_id == user_id and not record.is_read:
                record.is_read = True
                record.read_at = datetime.now(timezone.utc)
                count += 1
    return count
