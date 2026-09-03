// patient-portal/src/types/queue.ts

export interface QueueTokenStatus {
  token: string;
  department: string;
  status: "waiting" | "called" | "in_progress" | "completed" | "no_show";
  nowServingToken: string | null;
  position: number; // 1-indexed position of this token in the queue, 0 if not waiting
  patientsAhead: number;
  estimatedWaitMinutes: number | null;
  updatedAt: string; // ISO timestamp
}

export interface QueueListEntry {
  token: string;
  status: QueueTokenStatus["status"];
  position: number;
  patientName?: string; // may be omitted/redacted by backend for privacy
}

export interface DepartmentQueue {
  department: string;
  nowServingToken: string | null;
  entries: QueueListEntry[];
  updatedAt: string;
}
