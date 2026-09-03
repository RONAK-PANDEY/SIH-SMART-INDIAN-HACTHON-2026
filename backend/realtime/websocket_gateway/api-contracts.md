# API Contracts

## Realtime Events

**Gateway:** `backend/realtime/websocket_gateway/`
**Endpoint:** `ws://<host>/ws/queues/{queue_id}`

One socket connection is scoped to a single queue. To watch multiple
queues (e.g. a multi-doctor display board), open one connection per
`queue_id`.

### Envelope

Every message, in both directions, is JSON shaped like this:

```json
{
  "event": "queue.position_updated",
  "data": { /* event-specific payload, see below */ },
  "meta": {
    "event_id": "b1f2c1de-...",
    "ts": "2026-08-31T09:15:00.123Z",
    "queue_id": "q_123"
  }
}
```

- `event` — string, one of the event names below.
- `data` — object, shape depends on `event`.
- `meta.event_id` — unique id per message (useful for de-duping on reconnect).
- `meta.ts` — UTC ISO-8601 timestamp, server-set.
- `meta.queue_id` — always present, lets a client with multiple sockets route by queue.

Pydantic source of truth: `backend/realtime/websocket_gateway/schemas.py`.

---

### Client → Server events

#### `queue.subscribe`
Sent immediately after opening the socket.

```json
{
  "event": "queue.subscribe",
  "data": {
    "queue_id": "q_123",
    "role": "patient",           // "patient" | "display_board" | "doctor" | "staff"
    "auth_token": null           // required if role is "doctor" or "staff"
  }
}
```

Server responds with `connection.ack` (see below) or `error`.

#### `queue.unsubscribe`
```json
{
  "event": "queue.unsubscribe",
  "data": { "queue_id": "q_123" }
}
```

#### `doctor.call_next_request`
Sent by the doctor console when the doctor presses "Call Next". Requires
`role: "doctor"` to have been subscribed with a valid `auth_token`.

```json
{
  "event": "doctor.call_next_request",
  "data": {
    "doctor_id": "doc_9",
    "queue_id": "q_123",
    "room": "Room 4",
    "auth_token": "..."
  }
}
```

This request is **not** echoed back verbatim. On success the server
broadcasts `queue.call_next` immediately, followed by
`queue.now_serving_changed` once the state change is persisted. On
failure the requester (only) receives an `error` event.

#### `ping`
App-level heartbeat, for proxies/load balancers that swallow
protocol-level WS pings. Server replies with a `ping` envelope
(empty `data`) as a pong-equivalent.

---

### Server → Client events

#### `connection.ack`
Confirms a successful `queue.subscribe`.

```json
{
  "event": "connection.ack",
  "data": {
    "queue_id": "q_123",
    "subscriber_count": 4
  }
}
```

#### `queue.position_updated`
Broadcast to every subscriber of a queue whenever any patient's
position changes (new join, someone served, someone leaves/no-shows).
One event per affected patient — if a queue reshuffles, expect one of
these per patient whose position moved, not a full-list diff.

```json
{
  "event": "queue.position_updated",
  "data": {
    "patient_id": "pt_55",
    "token_number": "A-042",
    "position": 3,
    "previous_position": 4,
    "estimated_wait_minutes": 12
  }
}
```

| Field | Type | Notes |
|---|---|---|
| `patient_id` | string | |
| `token_number` | string | Human-facing token, e.g. shown on a ticket |
| `position` | int | 1-indexed; `1` means "up next" |
| `previous_position` | int \| null | `null` if this is the patient's first position event |
| `estimated_wait_minutes` | int \| null | Optional; omit/null if not computed |

#### `queue.now_serving_changed`
Broadcast when the confirmed "now serving" token for a queue changes.
This is the **authoritative** state change — use this (not
`queue.call_next`) to update any persistent "Now Serving: A-042" display.

```json
{
  "event": "queue.now_serving_changed",
  "data": {
    "doctor_id": "doc_9",
    "room": "Room 4",
    "now_serving_token": "A-042",
    "now_serving_patient_id": "pt_55",
    "previous_token": "A-041"
  }
}
```

`now_serving_token` and `now_serving_patient_id` are both `null` when
the doctor goes idle (no one currently being served).

#### `queue.call_next`
Broadcast the instant a doctor calls next, **before** persistence is
confirmed. Fires just ahead of `queue.now_serving_changed`. Intended
for optimistic UI ("Calling A-042...") — do not treat this alone as
confirmed state.

```json
{
  "event": "queue.call_next",
  "data": {
    "doctor_id": "doc_9",
    "room": "Room 4",
    "called_token": "A-042",
    "called_patient_id": "pt_55",
    "called_at": "2026-08-31T09:15:00.050Z"
  }
}
```

#### `error`
Sent only to the socket that caused it (never broadcast).

```json
{
  "event": "error",
  "data": {
    "code": "UNAUTHORIZED",
    "message": "auth_token required for this role"
  }
}
```

`code` is one of: `QUEUE_NOT_FOUND`, `UNAUTHORIZED`, `INVALID_PAYLOAD`,
`RATE_LIMITED`, `INTERNAL_ERROR`.

---

### Sequencing guarantees

- On `doctor.call_next_request` success: `queue.call_next` is always
  sent to all subscribers **before** `queue.now_serving_changed`.
- `queue.position_updated` events for patients behind the newly-served
  one follow `queue.now_serving_changed` (positions shift down by one).
- Reconnecting clients get no replay/backlog — always re-`subscribe`
  and treat the next `queue.now_serving_changed` /
  `queue.position_updated` you receive as the current truth. If you
  need last-known state on reconnect, fetch it from the REST snapshot
  endpoint (not part of this contract) rather than assuming the socket
  will replay it.

### Frontend hook sketch

```ts
const ws = new WebSocket(`wss://api.example.com/ws/queues/${queueId}`);

ws.onopen = () => {
  ws.send(JSON.stringify({
    event: "queue.subscribe",
    data: { queue_id: queueId, role: "patient" },
  }));
};

ws.onmessage = (msg) => {
  const { event, data } = JSON.parse(msg.data);
  switch (event) {
    case "connection.ack": /* ... */ break;
    case "queue.position_updated": /* ... */ break;
    case "queue.now_serving_changed": /* ... */ break;
    case "queue.call_next": /* optimistic UI */ break;
    case "error": /* ... */ break;
  }
};
```
