"""
Stub queue service.

This module intentionally contains NO real persistence or auth logic --
it exists so the gateway has a stable interface to call. Wire these
functions up to the real queue DB / auth system; do not change their
signatures without updating gateway.py and docs/api-contracts.md.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


class QueueServiceError(Exception):
    def __init__(self, code: str, message: str) -> None:
        self.code = code
        super().__init__(message)


@dataclass
class CallNextResult:
    patient_id: str
    token_number: str
    previous_token: Optional[str]


def authorize_doctor(doctor_id: str, auth_token: str) -> None:
    """Raise QueueServiceError('UNAUTHORIZED', ...) if auth_token is invalid."""
    if not auth_token:
        raise QueueServiceError("UNAUTHORIZED", "Missing auth token")
    # TODO: replace with real token verification against auth service.


def call_next_patient(queue_id: str, doctor_id: str, room: Optional[str]) -> CallNextResult:
    """
    Advance the queue and return the newly-called patient.
    TODO: replace with real DB transaction (pop head of queue, mark
    previous as served, persist now_serving state).
    """
    raise NotImplementedError("Wire this up to the real queue persistence layer.")
