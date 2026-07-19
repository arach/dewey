---
title: Protocol
description: Message format and wire protocol
---

# Protocol

All traffic is JSON over WebSocket. Every message uses the same envelope.

## Message envelope

```json
{
  "id": "msg-abc123",
  "sender": "dewey.main.mini",
  "target": "scout.main.mini",
  "action": "consult",
  "conversation": "dm.dewey.scout",
  "payload": {
    "text": "Status update on Path C reference build"
  },
  "timestamp": "2026-04-15T10:30:00Z"
}
```

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique message ID |
| `sender` | string | yes | Fully qualified agent name |
| `target` | string | no | Recipient agent — omit to broadcast |
| `action` | string | yes | One of `consult`, `delegate`, `notify`, `complete` |
| `conversation` | string | no | Thread ID for grouping related messages |
| `payload` | object | yes | Arbitrary JSON body |
| `timestamp` | string | yes | ISO 8601 timestamp |

## Actions

<StateFlow
  states={["consult", "delegate", "notify", "complete"]}
  terminal={["complete"]}
/>

| Action | Use when |
|--------|----------|
| **`consult`** | You need information back from another agent |
| **`delegate`** | You hand off a task — the receiver owns execution |
| **`notify`** | Fire-and-forget — no response expected |
| **`complete`** | Delegated work is done; carries the result |

## Connection lifecycle

```
Agent                        Broker
  |                            |
  |--- WebSocket connect ----->|
  |<-- connection accepted ----|
  |--- register { name, ... }->|
  |<-- registered { id } ------|
  |                            |
  |--- message { ... } ------->|
  |<-- message { ... } --------|
  |                            |
  |--- disconnect ------------->|
```