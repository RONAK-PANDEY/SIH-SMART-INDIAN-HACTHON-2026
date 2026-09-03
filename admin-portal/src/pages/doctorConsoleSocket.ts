import { io, Socket } from "socket.io-client";

// ---------------------------------------------------------------------------
// This file is the ONLY place that should know about the wire format of
// realtime/doctor_console. Event names below are placeholders and must be
// confirmed with Rishikesh before this goes to staging/prod.
//
// TODO(socket-contract): confirm all of the following with Rishikesh:
//   1. Event name to call the next patient, and its payload/ack shape
//   2. Event name for current-token updates
//   3. Event name for queue stats updates
//   4. Whether "complete consultation" is a socket event or REST endpoint
//   5. Room-join event/convention for a doctor's socket (e.g. "doctor:join")
//   6. Error event name/shape emitted by the server
// ---------------------------------------------------------------------------

interface CurrentToken {
  tokenNumber: string;
  patientName: string;
  isPriority: boolean;
}

interface QueueStats {
  todayTotal: number;
  completed: number;
  waiting: number;
  priority: number;
}

interface CompleteConsultationPayload {
  tokenNumber: string;
  notes: string;
  prescriptionSummary: string;
  followUpDate: string | null;
  referral: string | null;
}

export interface DoctorConsoleSocket {
  onConnectionChange(cb: (connected: boolean) => void): () => void;
  onStatsUpdate(cb: (stats: QueueStats) => void): () => void;
  onCurrentTokenUpdate(cb: (token: CurrentToken | null) => void): () => void;
  onError(cb: (message: string) => void): () => void;
  joinDoctorRoom(doctorId: string): void;
  leaveDoctorRoom(doctorId: string): void;
  callNext(doctorId: string): Promise<void>;
  completeConsultation(
    doctorId: string,
    payload: CompleteConsultationPayload
  ): Promise<void>;
}

// PLACEHOLDER event names — replace once contract is confirmed.
const EVENTS = {
  JOIN_ROOM: "doctor:join", // TODO(socket-contract)
  LEAVE_ROOM: "doctor:leave", // TODO(socket-contract)
  CALL_NEXT: "doctor:call-next", // TODO(socket-contract)
  COMPLETE_CONSULTATION: "doctor:complete-consultation", // TODO(socket-contract)
  STATS_UPDATE: "doctor:stats-update", // TODO(socket-contract)
  CURRENT_TOKEN_UPDATE: "doctor:current-token-update", // TODO(socket-contract)
  ERROR: "doctor:error", // TODO(socket-contract)
} as const;

let cachedSocket: Socket | null = null;

function getSocket(): Socket {
  if (!cachedSocket) {
    cachedSocket = io(import.meta.env.VITE_REALTIME_URL ?? "/", {
      autoConnect: true,
      transports: ["websocket"],
    });
  }
  return cachedSocket;
}

export function getDoctorConsoleSocket(): DoctorConsoleSocket {
  const socket = getSocket();

  return {
    onConnectionChange(cb) {
      const onConnect = () => cb(true);
      const onDisconnect = () => cb(false);
      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      cb(socket.connected);
      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
      };
    },

    onStatsUpdate(cb) {
      // TODO(socket-contract): confirm payload shape matches QueueStats.
      const handler = (stats: QueueStats) => cb(stats);
      socket.on(EVENTS.STATS_UPDATE, handler);
      return () => socket.off(EVENTS.STATS_UPDATE, handler);
    },

    onCurrentTokenUpdate(cb) {
      // TODO(socket-contract): confirm payload shape matches CurrentToken.
      const handler = (token: CurrentToken | null) => cb(token);
      socket.on(EVENTS.CURRENT_TOKEN_UPDATE, handler);
      return () => socket.off(EVENTS.CURRENT_TOKEN_UPDATE, handler);
    },

    onError(cb) {
      const handler = (payload: { message?: string } | string) => {
        cb(typeof payload === "string" ? payload : payload?.message ?? "Unknown error");
      };
      socket.on(EVENTS.ERROR, handler);
      return () => socket.off(EVENTS.ERROR, handler);
    },

    joinDoctorRoom(doctorId) {
      // TODO(socket-contract): confirm payload shape, e.g. { doctorId }.
      socket.emit(EVENTS.JOIN_ROOM, { doctorId });
    },

    leaveDoctorRoom(doctorId) {
      socket.emit(EVENTS.LEAVE_ROOM, { doctorId });
    },

    callNext(doctorId) {
      // TODO(socket-contract): confirm ack signature — assumed
      // (error?: { message: string } | null) => void.
      return new Promise((resolve, reject) => {
        socket.emit(
          EVENTS.CALL_NEXT,
          { doctorId },
          (ack?: { error?: string }) => {
            if (ack?.error) {
              reject(new Error(ack.error));
            } else {
              resolve();
            }
          }
        );
      });
    },

    completeConsultation(doctorId, payload) {
      // TODO(socket-contract): confirm this is a socket event at all, and
      // the exact payload/ack shape if so.
      return new Promise((resolve, reject) => {
        socket.emit(
          EVENTS.COMPLETE_CONSULTATION,
          { doctorId, ...payload },
          (ack?: { error?: string }) => {
            if (ack?.error) {
              reject(new Error(ack.error));
            } else {
              resolve();
            }
          }
        );
      });
    },
  };
}
