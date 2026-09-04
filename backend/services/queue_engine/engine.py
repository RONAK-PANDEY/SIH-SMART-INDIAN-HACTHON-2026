from typing import List, Dict, Optional
from datetime import datetime
from services.queue_engine.priority import PriorityCalculator, VulnerabilityFactors

class QueueTokenItem:
    def __init__(
        self,
        token_id: str,
        token_number: str,
        patient_id: str,
        hospital_id: str,
        department_id: str,
        triage_level: int = 4,
        vulnerability: Optional[VulnerabilityFactors] = None
    ):
        self.token_id = token_id
        self.token_number = token_number
        self.patient_id = patient_id
        self.hospital_id = hospital_id
        self.department_id = department_id
        self.triage_level = triage_level
        self.vulnerability = vulnerability or VulnerabilityFactors()
        self.issued_at = datetime.utcnow()
        self.status = "WAITING"
        self.priority_score = PriorityCalculator.calculate(self.issued_at, self.triage_level, self.vulnerability)

class QueueEngine:
    """
    Manages in-memory and persisted priority queues per hospital & department.
    """
    def __init__(self):
        # Maps queue_key -> List[QueueTokenItem]
        self._queues: Dict[str, List[QueueTokenItem]] = {}

    def _get_key(self, hospital_id: str, department_id: str) -> str:
        return f"{hospital_id}:{department_id}"

    def enqueue(self, token: QueueTokenItem) -> int:
        key = self._get_key(token.hospital_id, token.department_id)
        if key not in self._queues:
            self._queues[key] = []
        
        self._queues[key].append(token)
        self.reorder_queue(token.hospital_id, token.department_id)
        
        # Return position (1-indexed)
        for idx, item in enumerate(self._queues[key]):
            if item.token_id == token.token_id:
                return idx + 1
        return len(self._queues[key])

    def reorder_queue(self, hospital_id: str, department_id: str):
        key = self._get_key(hospital_id, department_id)
        if key not in self._queues:
            return
        
        # Recalculate priority scores dynamically
        for item in self._queues[key]:
            if item.status == "WAITING":
                item.priority_score = PriorityCalculator.calculate(item.issued_at, item.triage_level, item.vulnerability)
        
        # Sort descending by priority score
        self._queues[key].sort(key=lambda x: x.priority_score, reverse=True)

    def pop_next(self, hospital_id: str, department_id: str) -> Optional[QueueTokenItem]:
        key = self._get_key(hospital_id, department_id)
        if key not in self._queues or not self._queues[key]:
            return None
        
        for item in self._queues[key]:
            if item.status == "WAITING":
                item.status = "IN_CONSULTATION"
                return item
        return None

queue_engine = QueueEngine()
