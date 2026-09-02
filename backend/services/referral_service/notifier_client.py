"""
Thin client that lets referral_service create in-app notifications via
notification_service's HTTP API. Uses only the stdlib (urllib) so
referral_service does not need an extra HTTP dependency.

Failures are swallowed (logged) so that a notification-service outage
never blocks referral creation/confirmation - notifications are a
side-effect, not a critical path.
"""

from __future__ import annotations

import json
import logging
import os
import urllib.error
import urllib.request

logger = logging.getLogger("referral_service.notifier_client")

NOTIFICATION_SERVICE_URL = os.environ.get(
    "NOTIFICATION_SERVICE_URL", "http://localhost:8001"
)


def send_notification(
    user_id: str,
    notification_type: str,
    title: str,
    message: str,
    metadata: dict | None = None,
    timeout_seconds: float = 2.0,
) -> bool:
    """POST a notification to notification_service. Returns True on success,
    False otherwise (never raises)."""
    payload = {
        "user_id": user_id,
        "type": notification_type,
        "title": title,
        "message": message,
        "metadata": metadata or {},
    }
    url = f"{NOTIFICATION_SERVICE_URL}/notifications"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url, data=data, headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout_seconds) as resp:
            return 200 <= resp.status < 300
    except (urllib.error.URLError, OSError, TimeoutError) as exc:
        logger.warning("Failed to send notification to %s: %s", url, exc)
        return False
