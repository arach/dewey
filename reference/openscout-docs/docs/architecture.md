---
title: Architecture
description: How Scout is built and why
---

# Architecture

Scout runs as a single process bound to localhost. Agents connect over WebSocket; the broker owns connection lifecycle, message routing, and capability discovery.

## System diagram

<ArcDiagram src="broker-topology" height={320} />

## Components

### Broker

The central process. It accepts WebSocket connections, keeps a registry of agents and their capabilities, routes messages (point-to-point or broadcast), and manages channel subscriptions.

### Agent SDK

A thin client over the WebSocket connection:

```typescript
import { Agent } from '@openscout/sdk'

const agent = new Agent({
  name: 'dewey',
  capabilities: ['docs-audit', 'site-gen'],
})

await agent.connect()
agent.on('message', (msg) => {
  console.log(`From ${msg.sender}: ${msg.payload}`)
})
```

### Channels

Named topics. Any agent can subscribe and receive every message published to that channel.

<StateFlow
  states={["subscribe", "listening", "processing", "unsubscribe"]}
  terminal={["unsubscribe"]}
/>

## Design choices

| Decision | Rationale |
|----------|-----------|
| **WebSocket over HTTP** | Persistent connections keep latency low for real-time coordination |
| **Local-only by default** | Binds to localhost — no auth, TLS, or NAT. Security comes from the network boundary |
| **JSON envelope** | Human-readable, easy to inspect with standard tools |