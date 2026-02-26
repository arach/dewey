// Plain-text code snippets + prose for template previews.
// Syntax highlighting is applied at build time via Shiki.

export interface CodeSnippet {
  code: string
  lang: string
}

export interface StandardSection {
  id: string
  heading: string
  /** HTML prose before code blocks */
  prose: string
  codeSnippets: CodeSnippet[]
  /** HTML prose after code blocks (optional) */
  afterProse?: string
}

export interface SplitpaneSection {
  id: string
  heading: string
  prose: string
  codeSnippets: CodeSnippet[]
}

export const tocHeadings = [
  { depth: 2, slug: 'installation', text: 'Installation' },
  { depth: 2, slug: 'quick-setup', text: 'Quick Setup' },
  { depth: 2, slug: 'core-concepts', text: 'Core Concepts' },
  { depth: 3, slug: 'authentication', text: 'Authentication' },
  { depth: 3, slug: 'error-handling', text: 'Error Handling' },
  { depth: 2, slug: 'whats-next', text: "What's Next" },
]

export const standardSections: StandardSection[] = [
  {
    id: 'installation',
    heading: 'Installation',
    prose: '<p>Install the package using your preferred package manager:</p>',
    codeSnippets: [
      { code: 'npm install @acme/sdk', lang: 'bash' },
    ],
    afterProse: '<p>Or with pnpm:</p>',
  },
  {
    id: 'installation-alt',
    heading: '',
    prose: '',
    codeSnippets: [
      { code: 'pnpm add @acme/sdk', lang: 'bash' },
    ],
  },
  {
    id: 'quick-setup',
    heading: 'Quick Setup',
    prose: '<p>Initialize the client with your API key:</p>',
    codeSnippets: [
      {
        code: `import { createClient } from '@acme/sdk'

const client = createClient({
  apiKey: process.env.ACME_API_KEY,
  region: 'us-east-1',
})

// Fetch data with full type safety
const users = await client.users.list({
  limit: 10,
  orderBy: 'createdAt',
})`,
        lang: 'typescript',
      },
    ],
  },
  {
    id: 'core-concepts',
    heading: 'Core Concepts',
    prose: `<p>The SDK is built around three key ideas:</p>
<ol>
  <li><strong>Type Safety</strong> — Every API response is fully typed with TypeScript generics</li>
  <li><strong>Real-time Sync</strong> — Subscribe to changes with <code>client.subscribe()</code></li>
  <li><strong>Optimistic Updates</strong> — Mutations resolve instantly with automatic rollback on failure</li>
</ol>`,
    codeSnippets: [],
  },
  {
    id: 'authentication',
    heading: 'Authentication',
    prose: `<p>Authentication supports multiple strategies:</p>
<table>
  <thead>
    <tr><th>Strategy</th><th>Use Case</th><th>Setup</th></tr>
  </thead>
  <tbody>
    <tr><td>API Key</td><td>Server-to-server</td><td>Set <code>apiKey</code> in config</td></tr>
    <tr><td>OAuth 2.0</td><td>User-facing apps</td><td>Configure <code>oauth</code> provider</td></tr>
    <tr><td>JWT</td><td>Custom auth</td><td>Pass <code>token</code> function</td></tr>
  </tbody>
</table>`,
    codeSnippets: [],
  },
  {
    id: 'error-handling',
    heading: 'Error Handling',
    prose: '<p>All errors follow a consistent pattern:</p>',
    codeSnippets: [
      {
        code: `try {
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
}`,
        lang: 'typescript',
      },
    ],
  },
  {
    id: 'whats-next',
    heading: "What's Next",
    prose: `<ul>
  <li>Read the <a href="#">Configuration</a> guide for advanced setup</li>
  <li>Explore the API reference for all available methods</li>
  <li>Join the community Discord for help and discussion</li>
</ul>
<hr />
<p><em>Built with care by the Acme team.</em></p>`,
    codeSnippets: [],
  },
]

export const splitpaneSections: SplitpaneSection[] = [
  {
    id: 'installation',
    heading: 'Installation',
    prose: `<p>Install the Acme SDK using your preferred package manager. The SDK requires Node.js 18 or later.</p>
<p>The package includes TypeScript definitions out of the box — no need to install separate <code>@types</code> packages.</p>`,
    codeSnippets: [
      {
        code: `# npm
npm install @acme/sdk

# pnpm
pnpm add @acme/sdk

# yarn
yarn add @acme/sdk`,
        lang: 'bash',
      },
    ],
  },
  {
    id: 'quick-setup',
    heading: 'Quick Setup',
    prose: `<p>Initialize the client with your API key. The client is the main entry point for all SDK operations.</p>
<p>We recommend storing your API key in an environment variable. Never commit secrets to source control.</p>`,
    codeSnippets: [
      {
        code: `import { createClient } from '@acme/sdk'

const client = createClient({
  apiKey: process.env.ACME_API_KEY,
  region: 'us-east-1',
})`,
        lang: 'typescript',
      },
    ],
  },
  {
    id: 'fetching-data',
    heading: 'Fetching Data',
    prose: `<p>Query your data with full type safety. Every method returns typed results with autocomplete support in your editor.</p>
<p>Pagination, filtering, and sorting are all built in. Use <code>limit</code> and <code>offset</code> for cursor-based pagination.</p>`,
    codeSnippets: [
      {
        code: `const users = await client.users.list({
  limit: 10,
  orderBy: 'createdAt',
  filter: {
    role: 'admin',
  },
})

// users.data is fully typed
users.data.forEach(user => {
  console.log(user.email)
})`,
        lang: 'typescript',
      },
    ],
  },
  {
    id: 'error-handling',
    heading: 'Error Handling',
    prose: `<p>All errors follow a consistent pattern. The SDK throws typed <code>AcmeError</code> instances with structured error codes, human-readable messages, and field-level details.</p>
<p>Use the <code>code</code> property to programmatically handle specific error types.</p>`,
    codeSnippets: [
      {
        code: `try {
  const result = await client.users.create({
    email: 'dev@acme.com',
    role: 'admin',
  })
} catch (error) {
  if (error instanceof AcmeError) {
    console.log(error.code)
    console.log(error.message)
  }
}`,
        lang: 'typescript',
      },
    ],
  },
  {
    id: 'real-time',
    heading: 'Real-time Subscriptions',
    prose: `<p>Subscribe to changes in real time. The SDK uses WebSockets under the hood with automatic reconnection and exponential backoff.</p>
<p>Subscriptions are lightweight and share a single connection per client instance.</p>`,
    codeSnippets: [
      {
        code: `const unsub = client.subscribe(
  'users',
  (event) => {
    if (event.type === 'created') {
      console.log('New:', event.data)
    }
  }
)

// Clean up when done
unsub()`,
        lang: 'typescript',
      },
    ],
  },
]
