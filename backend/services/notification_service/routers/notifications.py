from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from .. import store
from ..models import Notification, NotificationCreate, NotificationListResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("", response_model=Notification, status_code=201)
def create_notification(payload: NotificationCreate) -> Notification:
    """Create an in-app notification record. Called directly by clients,
    or by other backend services (e.g. referral_service) as a side effect
    of their own events."""
    return store.create(payload)


@router.get("/user/{user_id}", response_model=NotificationListResponse)
def list_notifications(user_id: str, unread_only: bool = Query(False)) -> NotificationListResponse:
    items = store.list_for_user(user_id, unread_only=unread_only)
    all_items = store.list_for_user(user_id, unread_only=False)
    unread_count = sum(1 for n in all_items if not n.is_read)
    return NotificationListResponse(total=len(items), unread_count=unread_count, notifications=items)


@router.get("/{notification_id}", response_model=Notification)
def get_notification(notification_id: str) -> Notification:
    record = store.get(notification_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    return record


@router.patch("/{notification_id}/read", response_model=Notification)
def mark_notification_read(notification_id: str) -> Notification:
    record = store.mark_read(notification_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    return record


@router.post("/user/{user_id}/read-all")
def mark_all_read(user_id: str) -> dict:
    count = store.mark_all_read(user_id)
    return {"marked_read": count}
