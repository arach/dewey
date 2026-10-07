/** Run with Bun. Creates a new scratch project; never changes an existing project. */
import { mkdtemp, mkdir, readFile, writeFile, cp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const cli = process.env.DEWEY_CLI || resolve(import.meta.dir, '../src/cli/index.ts')
const runtime = process.env.DEWEY_RUNTIME || process.execPath
const root = await mkdtemp(join(tmpdir(), 'dewey-first-slice-'))
const transcript: string[] = []
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message) }
function run(...args: string[]) {
  const result = Bun.spawnSync([runtime, cli, ...args], { cwd: root, stdout: 'pipe', stderr: 'pipe' })
  const out = result.stdout.toString(); const err = result.stderr.toString()
  transcript.push(`$ dewey ${args.join(' ')}\nexit=${result.exitCode}\n${out}${err}`)
  return { code: result.exitCode, out, err }
}
function pass(...args: string[]) { const result = run(...args); assert(result.code === 0, `Failed ${args.join(' ')}: ${result.out}${result.err}`); return result }
function fail(code: string) {
  const result = run('check', '--json')
  assert(result.code === 1, `Expected check failure: ${code}`)
  assert(JSON.parse(result.out).issues.some((issue: { code: string }) => issue.code === code), `Missing ${code}: ${result.out}`)
  transcript.push(`Verified deliberate failure: ${code}\n`)
}
const fixture = resolve(import.meta.dir, '../test/fixtures/fresh-journal')
for (const name of ['src', 'test', 'package.json', 'README.md']) await cp(join(fixture, name), join(root, name), { recursive: true })
pass('init', '--rule', 'Never rewrite existing journal records during an append.')
fail('DOC_DRAFT')
await cp(join(fixture, 'docs'), join(root, 'docs'), { recursive: true })
const guide = await readFile(join(root, 'docs/quickstart.md'), 'utf8')
pass('review', 'docs/src.agent.md')
pass('build')
pass('check', '--json')
const test = Bun.spawnSync([process.execPath, 'run', 'test'], { cwd: root, stdout: 'pipe', stderr: 'pipe' })
assert(test.exitCode === 0, 'Scratch project test failed')
transcript.push(`$ bun run test\nexit=${test.exitCode}\n${test.stdout.toString()}${test.stderr.toString()}`)

await mkdir(join(root, 'src/sync'))
await writeFile(join(root, 'src/sync/index.ts'), 'export const enabled = true\n')
fail('MAP_MISSING')
await writeFile(join(root, 'docs/sync.agent.md'), '---\nkind: map\ntitle: Sync feature\ncovers: ["src/sync/**"]\n---\n# Sync feature\n\n`src/sync/index.ts` exports the feature flag; no I/O occurs.\n')
pass('review', 'docs/sync.agent.md'); pass('build'); pass('check', '--json')
await writeFile(join(root, 'src/index.ts'), await readFile(join(root, 'src/index.ts'), 'utf8') + '\n// Journal envelopes preserve append order.\n')
pass('build'); fail('REVIEW_REQUIRED')
await writeFile(join(root, 'docs/src.agent.md'), await readFile(join(root, 'docs/src.agent.md'), 'utf8') + '\nReviewed the append-order comment; runtime behavior is unchanged.\n')
pass('review', 'docs/src.agent.md'); pass('build'); pass('check', '--json')
for (const [extra, code] of [
  ['`src/not-found.ts`', 'MISSING_PATH'], ['`bun run no-such-script`', 'MISSING_SCRIPT'],
  ['```sh\ndewey_missing_binary_smoke_42\n```', 'UNKNOWN_COMMAND'],
  ['[Broken page](missing.md)', 'BROKEN_LINK'], ['[Broken heading](#missing)', 'BROKEN_ANCHOR'],
]) {
  await writeFile(join(root, 'docs/quickstart.md'), guide + '\n' + extra + '\n')
  fail(code)
  await writeFile(join(root, 'docs/quickstart.md'), guide)
  pass('check', '--json')
}
const front = await readFile(join(root, 'AGENTS.md'), 'utf8')
await writeFile(join(root, 'AGENTS.md'), front + '\nOverflow\n'.repeat(150)); fail('FRONT_DOOR_BUDGET')
await writeFile(join(root, 'AGENTS.md'), front)
await writeFile(join(root, 'docs/quickstart.md'), guide + '\nA successful append does not rewrite previous records.\n'); fail('STALE_OUTPUT'); pass('build')
const homePath = join(root, '.dewey/site/index.html'); const home = await readFile(homePath, 'utf8')
await writeFile(homePath, home.replace(/<nav[\s\S]*?<\/nav>/, '<nav><a href="missing.html">Broken</a></nav>'))
fail('NAV_MISSING'); fail('SITE_LINK')
assert(run('build').code !== 0, 'Build must refuse a modified generated file')
await writeFile(homePath, home)
const manual = '\n## Manual preservation proof\n\nNever remove this authored rule.\n'
await writeFile(join(root, 'AGENTS.md'), front + manual)
await writeFile(join(root, 'llms.txt'), 'Manual index preface.\n' + await readFile(join(root, 'llms.txt'), 'utf8'))
await writeFile(join(root, 'docs/old-plan.md'), '---\nkind: history\n---\n# Historical direction\n\nNever include this by default.\n')
pass('init', '--no-rules'); pass('build'); pass('check', '--json')
assert((await readFile(join(root, 'AGENTS.md'), 'utf8')).endsWith(manual), 'Manual front-door rule lost')
assert((await readFile(join(root, 'llms.txt'), 'utf8')).startsWith('Manual index preface.'), 'Manual index preface lost')
const finalHome = await readFile(homePath, 'utf8')
assert(!finalHome.includes('Historical direction') && !finalHome.includes('Journal implementation'), 'Maps/history leaked to navigation')

const site = join(root, '.dewey/site')
const server = Bun.serve({ hostname: '127.0.0.1', port: 0, async fetch(request) {
  const url = new URL(request.url)
  const path = resolve(site, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname))
  if (!path.startsWith(site + '/')) return new Response('Forbidden', { status: 403 })
  const file = Bun.file(path)
  return await file.exists() ? new Response(file) : new Response('Not found', { status: 404 })
} })
try {
  for (const route of ['/', '/docs/quickstart.html', '/readme.html', '/docs/reference/api.html', '/site.js', '/search.js', '/themes/ink.css', '/llms.txt', '/style.css']) {
    const response = await fetch(`http://127.0.0.1:${server.port}${route}`)
    assert(response.status === 200, `HTTP smoke failed: ${route}`)
    transcript.push(`GET ${route} → ${response.status}\n`)
  }
} finally { server.stop(true) }
await writeFile(join(root, 'proof.log'), transcript.join('\n'))
await writeFile('/tmp/dewey-first-slice-latest.json', JSON.stringify({ root, cli, site }, null, 2))
console.log(`PASS: fresh project, deliberate failures, preservation, and HTTP smoke.\nProject: ${root}\nTranscript: ${root}/proof.log\nCLI: ${runtime} ${cli}\nPreview: python3 -m http.server 4387 --bind 127.0.0.1 --directory ${site}`)
