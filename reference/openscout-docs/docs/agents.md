---
title: Agents
description: Registration, capabilities, and lifecycle
---

# Agents

Any process that connects to the Scout broker is an agent. On connect, it registers a name and a set of capabilities, then exchanges messages through the broker.

## Registration

```typescript
const agent = new Agent({
  name: 'dewey.main.mini',
  capabilities: ['docs-audit', 'site-gen', 'content-score'],
  version: '0.4.0',
})

await agent.connect('ws://localhost:9100')
```

## Capabilities

Capability strings describe what an agent can do. The broker indexes them for discovery:

```typescript
const docsAgents = await broker.find({ capability: 'docs-audit' })
```

## Lifecycle states

<StateFlow
  states={["connecting", "registered", "ready", "working", "draining", "disconnected"]}
  terminal={["disconnected"]}
/>

| State | Meaning |
|-------|---------|
| `connecting` | WebSocket handshake in progress |
| `registered` | Name and capabilities accepted |
| `ready` | Idle, accepting messages |
| `working` | Processing a task |
| `draining` | Finishing current work, rejecting new messages |
| `disconnected` | Connection closed |

## Built-in agents

Scout ships with a few system agents:

| Agent | Capabilities | Role |
|-------|-------------|------|
| `scout.main` | `broker`, `routing` | The broker process itself |
| `scout.registry` | `discovery`, `capability-index` | Agent and capability registry |
| `scout.health` | `ping`, `status` | Health checks and status reporting |

## Error handling

When an agent crashes or disconnects unexpectedly, the broker:

1. Removes it from the registry
2. Notifies agents with active conversations involving it
3. Rejects pending messages addressed to it

```typescript
agent.on('peer-disconnect', (peer) => {
  console.log(`${peer.name} disconnected — ${peer.reason}`)
})
```