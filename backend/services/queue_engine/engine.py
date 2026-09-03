"""
QueueEngine: staff-verified, priority-aware patient queue implementing
docs/business-rules.md Section 1 (Priority Queue Algorithm) in full,
including the anti-starvation dispatch sequence in Section 1.4.

This is deliberately NOT a plain FIFO pop. The dispatch decision for
"who is next" is recomputed from scratch on every call against live
patient state (category + wait time), per the spec's own framing of it
as evaluated "for every 'next patient' decision" rather than as a
queue with a fixed insertion order.

DISPATCH ALGORITHM (Section 1.4, step by step)
-----------------------------------------------
1. If any patient is EMERGENCY: dispatch the longest-waiting EMERGENCY
   patient. No exceptions -- this check always runs first.
2. Otherwise, check the hard cap: if any NORMAL patient has waited more
   than `normal_max_wait_minutes`, force-dispatch them next (ties broken
   by longest overage, then earliest check-in). This overrides the
   category-rank ordering in step 4 but still yields to EMERGENCY (step 1).
3. Otherwise, increment the per-queue `slot_count`. If
   `slot_count % normal_priority_slot_ratio == 0` and at least one NORMAL
   patient exists, dispatch the NORMAL patient with the highest
   wait-time score (ties broken by earliest check-in).
4. Otherwise, dispatch in category rank order
   (CRITICAL > SENIOR > PWD > NORMAL), FIFO (earliest check-in) within
   category.

Patients in UNASSIGNED are never visible to dispatch -- they must first
go through `assign_category` (Section 1.2).
"""

from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from .config import QueueEngineConfig
from .models import (
    AssignmentLogEntry,
    CATEGORY_DISPATCH_RANK,
    Patient,
    PriorityCategory,
    TriageResult,
    VerificationMethod,
)


class QueueEngineError(Exception):
    pass


class PatientNotFoundError(QueueEngineError):
    pass


class InvalidAssignmentError(QueueEngineError):
    pass


# Categories that require an authenticated clinical staff member
# (nurse/physician), per Section 1.2.
_CLINICAL_ONLY_CATEGORIES = {PriorityCategory.EMERGENCY, PriorityCategory.CRITICAL}

# Verification methods considered acceptable per target category.
_VALID_VERIFICATIONS = {
    PriorityCategory.EMERGENCY: {VerificationMethod.CLINICAL_TRIAGE},
    PriorityCategory.CRITICAL: {VerificationMethod.CLINICAL_TRIAGE},
    PriorityCategory.SENIOR: {
        VerificationMethod.GOVERNMENT_ID,
        VerificationMethod.PATIENT_RECORD,
    },
    PriorityCategory.PWD: {
        VerificationMethod.PWD_ID_CARD,
        VerificationMethod.DISABILITY_CERTIFICATE,
        VerificationMethod.PROVISIONAL_VISIBLE_DISABILITY,
    },
    PriorityCategory.NORMAL: {VerificationMethod.DEFAULT_UNQUALIFIED},
}


def resolve_priority_category(
    *,
    triage_result: Optional[TriageResult] = None,
    clinician_deems_immediate_life_threat: bool = False,
    is_pwd: bool = False,
    is_senior: bool = False,
) -> PriorityCategory:
    """
    Resolve which single PriorityCategory a patient should be assigned,
    per Section 1.1's "higher-ranked category wins" rule and the explicit
    PWD > SENIOR tie-break, plus the Section 2.4 mapping table.

    This does not itself assign anything -- it's a pure decision helper.
    The actual assignment (with staff_id / verification / logging) must
    still go through `QueueEngine.assign_category`.

    Per the Section 2.4 note: SENIOR/PWD status is independent of and
    stacks with triage outcome. A patient triaged URGENT still takes
    EMERGENCY/CRITICAL (clinical categories always win over non-clinical
    ones); a patient triaged ROUTINE/PRIORITY who is also SENIOR or PWD
    is queued under SENIOR/PWD, not NORMAL.
    """
    if triage_result == TriageResult.URGENT:
        return (
            PriorityCategory.EMERGENCY
            if clinician_deems_immediate_life_threat
            else PriorityCategory.CRITICAL
        )
    if is_pwd:
        return PriorityCategory.PWD
    if is_senior:
        return PriorityCategory.SENIOR
    return PriorityCategory.NORMAL


def _initial_wait_score(
    category: PriorityCategory,
    triage_result: Optional[TriageResult],
    config: QueueEngineConfig,
) -> float:
    """Section 2.4 mapping: only meaningful for NORMAL-category patients."""
    if category != PriorityCategory.NORMAL:
        return 0.0
    if triage_result == TriageResult.PRIORITY:
        return config.priority_starting_wait_score
    return 0.0


class QueueEngine:
    """One instance per facility queue (e.g. per department)."""

    def __init__(self, config: Optional[QueueEngineConfig] = None):
        self.config = config or QueueEngineConfig()
        self._patients: Dict[str, Patient] = {}
        self._unassigned: Dict[str, Patient] = {}
        self._slot_count: int = 0
        self.assignment_log: List[AssignmentLogEntry] = []

    # ------------------------------------------------------------------
    # Intake (Section 1.2): check-in creates an UNASSIGNED patient who is
    # NOT visible in dispatch until a staff member assigns a category.
    # ------------------------------------------------------------------

    def check_in(self, patient_id: str, check_in_time: datetime, metadata: Optional[dict] = None) -> Patient:
        if patient_id in self._patients or patient_id in self._unassigned:
            raise QueueEngineError(f"Patient {patient_id!r} already checked in")
        patient = Patient(
            patient_id=patient_id,
            category=PriorityCategory.UNASSIGNED,
            check_in_time=check_in_time,
            metadata=metadata or {},
        )
        self._unassigned[patient_id] = patient
        return patient

    # ------------------------------------------------------------------
    # Staff-verified assignment (Section 1.2)
    # ------------------------------------------------------------------

    def assign_category(
        self,
        patient_id: str,
        category: PriorityCategory,
        *,
        staff_id: str,
        staff_is_clinical: bool,
        verification_method: VerificationMethod,
        timestamp: datetime,
        triage_result: Optional[TriageResult] = None,
        provisional: bool = False,
        id_last4: Optional[str] = None,
    ) -> Patient:
        """
        Move a patient from UNASSIGNED into the live queue under `category`.
        Enforces the Section 1.2 rules:
          - EMERGENCY/CRITICAL require a clinical staff member and
            CLINICAL_TRIAGE verification (URGENT triage result).
          - SENIOR requires GOVERNMENT_ID or PATIENT_RECORD verification.
          - PWD requires PWD_ID_CARD/DISABILITY_CERTIFICATE, or a
            PROVISIONAL_VISIBLE_DISABILITY note pending reconciliation.
          - Every assignment is logged immutably.
        """
        if category == PriorityCategory.UNASSIGNED:
            raise InvalidAssignmentError("Cannot assign a patient to UNASSIGNED")

        if category in _CLINICAL_ONLY_CATEGORIES and not staff_is_clinical:
            raise InvalidAssignmentError(
                f"{category.value} may only be assigned by clinical staff (nurse/physician)"
            )

        if category in _CLINICAL_ONLY_CATEGORIES and triage_result != TriageResult.URGENT:
            raise InvalidAssignmentError(
                f"{category.value} requires a triage result of URGENT"
            )

        valid_methods = _VALID_VERIFICATIONS.get(category, set())
        if verification_method not in valid_methods:
            raise InvalidAssignmentError(
                f"{verification_method.value} is not an accepted verification method "
                f"for {category.value}"
            )

        if category == PriorityCategory.PWD:
            provisional = provisional or (
                verification_method == VerificationMethod.PROVISIONAL_VISIBLE_DISABILITY
            )
        else:
            provisional = False

        patient = self._unassigned.pop(patient_id, None) or self._patients.get(patient_id)
        if patient is None:
            raise PatientNotFoundError(patient_id)

        patient.category = category
        patient.triage_result = triage_result
        patient.base_wait_score = _initial_wait_score(category, triage_result, self.config)
        self._patients[patient_id] = patient

        self.assignment_log.append(
            AssignmentLogEntry(
                staff_id=staff_id,
                timestamp=timestamp,
                category_assigned=category,
                verification_method=verification_method,
                patient_id=patient_id,
                provisional=provisional,
                id_last4=id_last4,
            )
        )
        return patient

    def reassign_category(
        self,
        patient_id: str,
        new_category: PriorityCategory,
        *,
        staff_id: str,
        staff_is_clinical: bool,
        verification_method: VerificationMethod,
        timestamp: datetime,
        reason: str,
        triage_result: Optional[TriageResult] = None,
        provisional: bool = False,
        id_last4: Optional[str] = None,
    ) -> Patient:
        """
        Re-assignment after initial assignment. Section 1.2: staff-only,
        must independently re-verify, and must include a `reason`.
        """
        if patient_id not in self._patients:
            raise PatientNotFoundError(patient_id)
        if not reason:
            raise InvalidAssignmentError("Re-assignment requires a `reason`")

        # Re-run the same eligibility checks as a fresh assignment.
        if new_category in _CLINICAL_ONLY_CATEGORIES and not staff_is_clinical:
            raise InvalidAssignmentError(
                f"{new_category.value} may only be assigned by clinical staff (nurse/physician)"
            )
        if new_category in _CLINICAL_ONLY_CATEGORIES and triage_result != TriageResult.URGENT:
            raise InvalidAssignmentError(
                f"{new_category.value} requires a triage result of URGENT"
            )
        valid_methods = _VALID_VERIFICATIONS.get(new_category, set())
        if verification_method not in valid_methods:
            raise InvalidAssignmentError(
                f"{verification_method.value} is not an accepted verification method "
                f"for {new_category.value}"
            )

        if new_category == PriorityCategory.PWD:
            provisional = provisional or (
                verification_method == VerificationMethod.PROVISIONAL_VISIBLE_DISABILITY
            )
        else:
            provisional = False

        patient = self._patients[patient_id]
        patient.category = new_category
        patient.triage_result = triage_result
        patient.base_wait_score = _initial_wait_score(new_category, triage_result, self.config)

        self.assignment_log.append(
            AssignmentLogEntry(
                staff_id=staff_id,
                timestamp=timestamp,
                category_assigned=new_category,
                verification_method=verification_method,
                patient_id=patient_id,
                reason=reason,
                provisional=provisional,
                id_last4=id_last4,
            )
        )
        return patient

    def reconcile_provisional_pwd(self, patient_id: str, *, staff_id: str, timestamp: datetime, id_document: str) -> None:
        """
        Section 1.2: a provisional PWD assignment must be reconciled with
        real documentation on the same visit before discharge, or it
        reverts to NORMAL for any future visit if never reconciled. This
        marks the current provisional entry as reconciled by logging a
        confirming entry; it does not change the patient's live category
        (they were already being queued as PWD).
        """
        patient = self._patients.get(patient_id)
        if patient is None:
            raise PatientNotFoundError(patient_id)
        if patient.category != PriorityCategory.PWD:
            raise InvalidAssignmentError("Patient is not currently assigned PWD")

        self.assignment_log.append(
            AssignmentLogEntry(
                staff_id=staff_id,
                timestamp=timestamp,
                category_assigned=PriorityCategory.PWD,
                verification_method=VerificationMethod.PWD_ID_CARD,
                patient_id=patient_id,
                reason="Reconciliation of provisional PWD assignment",
                id_last4=id_document[-4:] if id_document else None,
            )
        )

    def expire_unreconciled_provisional_pwd(self, patient_id: str, *, staff_id: str, timestamp: datetime) -> Patient:
        """
        If a provisional PWD assignment was never reconciled by discharge,
        it reverts to NORMAL (for the *next* visit, per spec -- exposed
        here as an explicit staff-triggered action rather than an
        implicit background timer, since "before discharge" is an
        operational event this module doesn't otherwise observe).
        """
        patient = self._patients.get(patient_id)
        if patient is None:
            raise PatientNotFoundError(patient_id)
        return self.reassign_category(
            patient_id,
            PriorityCategory.NORMAL,
            staff_id=staff_id,
            staff_is_clinical=False,
            verification_method=VerificationMethod.DEFAULT_UNQUALIFIED,
            timestamp=timestamp,
            reason="Provisional PWD assignment never reconciled with documentation before discharge",
        )

    # ------------------------------------------------------------------
    # Removal (served elsewhere, left, etc.)
    # ------------------------------------------------------------------

    def remove(self, patient_id: str) -> Patient:
        if patient_id in self._patients:
            return self._patients.pop(patient_id)
        if patient_id in self._unassigned:
            return self._unassigned.pop(patient_id)
        raise PatientNotFoundError(patient_id)

    # ------------------------------------------------------------------
    # Dispatch (Section 1.4)
    # ------------------------------------------------------------------

    def _normal_patients(self) -> List[Patient]:
        return [p for p in self._patients.values() if p.category == PriorityCategory.NORMAL]

    def _emergency_patients(self) -> List[Patient]:
        return [p for p in self._patients.values() if p.category == PriorityCategory.EMERGENCY]

    def peek_next(self, now: Optional[datetime] = None) -> Optional[Patient]:
        """Return (without removing or mutating slot_count) the patient
        that would be served next."""
        now = now or datetime.utcnow()
        patient, _ = self._select(now)
        return patient

    def dispatch_next(self, now: Optional[datetime] = None) -> Optional[Patient]:
        """Pop and return the next patient to be served, per Section 1.4."""
        now = now or datetime.utcnow()
        patient, consumes_slot = self._select(now)
        if patient is None:
            return None
        del self._patients[patient.patient_id]
        if consumes_slot:
            self._slot_count += 1
        return patient

    def _select(self, now: datetime):
        """
        Returns (patient_or_None, consumes_slot_bool).

        consumes_slot indicates whether this dispatch should increment
        slot_count -- per the spec, the counter lives in the "Else"
        (non-EMERGENCY) branch, so EMERGENCY dispatches don't advance it.
        """
        cfg = self.config

        # Step 1: EMERGENCY always wins, no exceptions.
        emergencies = self._emergency_patients()
        if emergencies:
            oldest = min(emergencies, key=lambda p: p._seq)
            return oldest, False

        normals = self._normal_patients()

        # Step 2 (hard cap, evaluated before the slot counter so it can
        # override step 4 regardless of slot-count state): any NORMAL
        # patient waiting past normal_max_wait_minutes is force-dispatched.
        over_cap = [p for p in normals if p.wait_minutes(now) > cfg.normal_max_wait_minutes]
        if over_cap:
            over_cap.sort(key=lambda p: (-p.wait_minutes(now), p._seq))
            return over_cap[0], True

        if not self._patients:
            return None, False

        # Step 3: every Nth slot (default every 4th) is reserved for the
        # NORMAL patient with the highest wait-time score, if any NORMAL
        # patient exists.
        prospective_slot = self._slot_count + 1
        if prospective_slot % cfg.normal_priority_slot_ratio == 0 and normals:
            normals.sort(
                key=lambda p: (-p.wait_score(now, cfg.normal_aging_interval_minutes), p._seq)
            )
            return normals[0], True

        # Step 4: category rank order, FIFO within category.
        candidates = [p for p in self._patients.values()]
        if not candidates:
            return None, False
        candidates.sort(key=lambda p: (CATEGORY_DISPATCH_RANK[p.category], p._seq))
        return candidates[0], True

    # ------------------------------------------------------------------
    # Introspection
    # ------------------------------------------------------------------

    def __len__(self) -> int:
        return len(self._patients)

    def unassigned_count(self) -> int:
        return len(self._unassigned)

    def counts_by_category(self) -> Dict[str, int]:
        counts = {c.value: 0 for c in PriorityCategory}
        for p in self._patients.values():
            counts[p.category.value] += 1
        counts[PriorityCategory.UNASSIGNED.value] = len(self._unassigned)
        return counts

    def snapshot(self, now: Optional[datetime] = None) -> List[dict]:
        """
        Non-destructive ordered view of the queue as it would actually be
        served, for dashboards/logs. Simulates repeated dispatch_next()
        calls on a deep-enough copy of engine state.
        """
        now = now or datetime.utcnow()
        clone = QueueEngine(self.config)
        clone._patients = dict(self._patients)
        clone._slot_count = self._slot_count

        result = []
        position = 0
        while len(clone):
            p = clone.dispatch_next(now)
            position += 1
            result.append(
                {
                    "position": position,
                    "patient_id": p.patient_id,
                    "category": p.category.value,
                    "wait_minutes": round(p.wait_minutes(now), 2),
                    "wait_score": (
                        round(p.wait_score(now, self.config.normal_aging_interval_minutes), 2)
                        if p.category == PriorityCategory.NORMAL
                        else None
                    ),
                }
            )
        return result
