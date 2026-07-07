---
title: Overview
description: What Scout does and when to use it
---

# Overview

Scout is a local agent broker. It gives every agent on your machine a single WebSocket connection to the broker, which handles discovery, routing, and message delivery.

## Why use a broker?

Point-to-point connections work fine for two agents. Add a third and you're managing three sockets. At ten agents, that's forty-five pairwise links. A broker collapses that to one connection per agent and centralizes routing.

## Core concepts

| Concept | What it is |
|---------|------------|
| **Agent** | A process that registers with the broker and sends or receives messages |
| **Channel** | A named topic — agents subscribe to receive everything published on it |
| **Message** | A JSON envelope with sender, target, action, and payload |
| **Capability** | A skill string an agent advertises so others can find it |

## Agent lifecycle

<StateFlow states={["register", "ready", "working", "done"]} terminal={["done"]} />

On startup, an agent registers with the broker and declares its capabilities. It moves to `ready` and waits for work. Incoming messages push it to `working`; when finished it returns to `ready`, or transitions to `done` on shutdown.

## Where to go next

- [Architecture](architecture.md) — how the broker, SDK, and channels fit together
- [Protocol](protocol.md) — message envelope and wire format