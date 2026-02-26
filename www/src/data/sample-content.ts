import type { NavigationConfig } from '../../../packages/docs/src/types/page-tree'

export const sampleDocs: Record<string, string> = {
  'getting-started': `# Getting Started

Welcome to **Acme SDK** — the fastest way to build modern applications with type-safe APIs and real-time data.

## Installation

Install the package using your preferred package manager:

\`\`\`bash
npm install @acme/sdk
\`\`\`

Or with pnpm:

\`\`\`bash
pnpm add @acme/sdk
\`\`\`

## Quick Setup

Initialize the client with your API key:

\`\`\`typescript
import { createClient } from '@acme/sdk'

const client = createClient({
  apiKey: process.env.ACME_API_KEY,
  region: 'us-east-1',
})

// Fetch data with full type safety
const users = await client.users.list({
  limit: 10,
  orderBy: 'createdAt',
})
\`\`\`

> **Note:** Never expose your API key in client-side code. Use environment variables or a server-side proxy.

## Core Concepts

The SDK is built around three key ideas:

1. **Type Safety** — Every API response is fully typed with TypeScript generics
2. **Real-time Sync** — Subscribe to changes with \`client.subscribe()\`
3. **Optimistic Updates** — Mutations resolve instantly with automatic rollback on failure

### Authentication

Authentication supports multiple strategies:

| Strategy | Use Case | Setup |
|----------|----------|-------|
| API Key | Server-to-server | Set \`apiKey\` in config |
| OAuth 2.0 | User-facing apps | Configure \`oauth\` provider |
| JWT | Custom auth | Pass \`token\` function |

### Error Handling

All errors follow a consistent pattern:

\`\`\`typescript
try {
  const result = await client.users.create({
    email: 'dev@acme.com',
    role: 'admin',
  })
} catch (error) {
  if (error instanceof AcmeError) {
    console.log(error.code)    // 'VALIDATION_ERROR'
    console.log(error.message) // Human-readable message
    console.log(error.details) // Field-level errors
  }
}
\`\`\`

## What's Next

- Read the [Configuration](configuration) guide for advanced setup
- Explore the API reference for all available methods
- Join the community Discord for help and discussion

---

*Built with care by the Acme team.*
`,

  'configuration': `# Configuration

Fine-tune the SDK behavior for your application's needs.

## Client Options

The \`createClient\` function accepts a configuration object:

\`\`\`typescript
import { createClient } from '@acme/sdk'

const client = createClient({
  apiKey: process.env.ACME_API_KEY,
  region: 'us-east-1',
  timeout: 30_000,
  retries: 3,
  debug: process.env.NODE_ENV === 'development',
})
\`\`\`

## Available Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| \`apiKey\` | \`string\` | — | Your API key (required) |
| \`region\` | \`string\` | \`'us-east-1'\` | Data center region |
| \`timeout\` | \`number\` | \`30000\` | Request timeout in ms |
| \`retries\` | \`number\` | \`3\` | Max retry attempts |
| \`debug\` | \`boolean\` | \`false\` | Enable debug logging |

## Environment Variables

The SDK automatically reads these environment variables:

\`\`\`bash
ACME_API_KEY=your-api-key
ACME_REGION=us-east-1
ACME_DEBUG=true
\`\`\`

> **Tip:** Use a \`.env.local\` file for local development and add it to \`.gitignore\`.

## Middleware

Add custom middleware to intercept requests and responses:

\`\`\`typescript
client.use(async (ctx, next) => {
  console.log(\`Request: \${ctx.method} \${ctx.path}\`)
  const start = Date.now()
  await next()
  console.log(\`Response: \${Date.now() - start}ms\`)
})
\`\`\`

## TypeScript Support

The SDK ships with full TypeScript declarations. Enable strict mode for the best experience:

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler"
  }
}
\`\`\`
`,
}

export const sampleConfig = {
  name: 'Acme SDK',
  tagline: 'Build modern apps with type-safe APIs',
  basePath: '/docs',
  homeUrl: '/',
  navigation: [
    {
      title: 'Getting Started',
      items: [
        { id: 'getting-started', title: 'Introduction' },
        { id: 'configuration', title: 'Configuration' },
      ],
    },
  ] satisfies NavigationConfig,
}
