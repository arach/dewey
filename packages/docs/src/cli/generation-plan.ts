import { createHash } from 'crypto'
import { lstat, mkdir, readFile, unlink, writeFile } from 'fs/promises'
import { dirname, isAbsolute, join, normalize, relative, resolve } from 'path'

export const GENERATED_FILES_MANIFEST = '.dewey-generated.json'
export const GENERATED_MARKER = '<!-- dewey:generated owner=dewey -->'

export type GenerationScope =
  | 'agentsMd'
  | 'llmsTxt'
  | 'docsJson'
  | 'installMd'
  | 'agentArtifacts'

export type GenerationAction = 'create' | 'update' | 'delete' | 'unchanged' | 'preserve'

export interface GeneratedArtifact {
  path: string
  content: string
  scope: GenerationScope
  marker?: boolean
}

export interface GenerationOperation {
  action: GenerationAction
  path: string
  scope: GenerationScope | 'ownershipManifest'
  content?: string
  reason?: string
}

export interface GenerationPlan {
  outputDir: string
  operations: GenerationOperation[]
  blocked: boolean
  blockers: string[]
}

export interface GenerationPlanOptions {
  /** Explicitly replace an existing desired output that is not yet Dewey-owned. */
  overwrite?: boolean
}

interface OwnedFile {
  hash: string
  scope: GenerationScope
}

interface GeneratedFilesManifest {
  schemaVersion: 1
  generator: 'dewey'
  files: Record<string, OwnedFile>
}

const scopes: GenerationScope[] = [
  'agentsMd',
  'llmsTxt',
  'docsJson',
  'installMd',
  'agentArtifacts',
]

export function addGeneratedMarker(content: string): string {
  const normalized = content.replace(/\s+$/, '')
  if (normalized.includes(GENERATED_MARKER)) return `${normalized}\n`
  return `${normalized}\n\n${GENERATED_MARKER}\n`
}

export async function planGeneratedArtifacts(
  outputDir: string,
  artifacts: GeneratedArtifact[],
  selectedScopes: GenerationScope[],
  options: GenerationPlanOptions = {},
): Promise<GenerationPlan> {
  const resolvedOutput = resolve(outputDir)
  const selected = new Set(selectedScopes)
  const desired = new Map<string, GeneratedArtifact>()

  for (const artifact of artifacts) {
    const path = assertSafeArtifactPath(artifact.path)
    if (!selected.has(artifact.scope)) {
      throw new Error(`Artifact ${path} is outside the selected generation scope`)
    }
    if (desired.has(path)) throw new Error(`Duplicate generated artifact path: ${path}`)
    desired.set(path, {
      ...artifact,
      path,
      content: artifact.marker ? addGeneratedMarker(artifact.content) : ensureTrailingNewline(artifact.content),
    })
  }

  const manifestPath = join(resolvedOutput, GENERATED_FILES_MANIFEST)
  await assertNoSymlinkComponents(resolvedOutput, GENERATED_FILES_MANIFEST)
  const existingManifestContent = await readOptionalFile(manifestPath)
  const previousManifest = parseManifest(existingManifestContent)
  const previousFiles = previousManifest?.files ?? {}
  const nextFiles: Record<string, OwnedFile> = {}
  const operations: GenerationOperation[] = []

  for (const [path, owned] of Object.entries(previousFiles)) {
    if (selected.has(owned.scope)) continue
    await assertNoSymlinkComponents(resolvedOutput, path)
    if (await readOptionalFile(join(resolvedOutput, path)) !== null) nextFiles[path] = owned
  }

  for (const artifact of desired.values()) {
    const filePath = join(resolvedOutput, artifact.path)
    await assertNoSymlinkComponents(resolvedOutput, artifact.path)
    const current = await readOptionalFile(filePath)
    const previous = previousFiles[artifact.path]
    const desiredHash = hashContent(artifact.content)
    const currentHash = current === null ? null : hashContent(current)
    const isOwned = previous
      ? currentHash === previous.hash
      : Boolean(
          current?.split(/\r?\n/).includes(GENERATED_MARKER)
          || artifact.scope === 'agentArtifacts' && current === artifact.content
        )

    if (current === null) {
      operations.push({ action: 'create', path: artifact.path, scope: artifact.scope, content: artifact.content })
      nextFiles[artifact.path] = { hash: desiredHash, scope: artifact.scope }
    } else if (current === artifact.content && isOwned) {
      operations.push({ action: 'unchanged', path: artifact.path, scope: artifact.scope })
      nextFiles[artifact.path] = { hash: desiredHash, scope: artifact.scope }
    } else if (isOwned || options.overwrite) {
      operations.push({ action: 'update', path: artifact.path, scope: artifact.scope, content: artifact.content })
      nextFiles[artifact.path] = { hash: desiredHash, scope: artifact.scope }
    } else {
      operations.push({
        action: 'preserve',
        path: artifact.path,
        scope: artifact.scope,
        reason: previous
          ? 'Dewey output was modified after generation'
          : 'existing file is not recorded as Dewey-owned',
      })
      if (previous) nextFiles[artifact.path] = previous
    }
  }

  for (const [path, owned] of Object.entries(previousFiles)) {
    if (!selected.has(owned.scope) || desired.has(path)) continue

    await assertNoSymlinkComponents(resolvedOutput, path)
    const current = await readOptionalFile(join(resolvedOutput, path))
    if (current === null) continue
    if (hashContent(current) === owned.hash) {
      operations.push({ action: 'delete', path, scope: owned.scope })
    } else {
      operations.push({
        action: 'preserve',
        path,
        scope: owned.scope,
        reason: 'stale Dewey output was modified after generation',
      })
    }
  }

  const nextManifest: GeneratedFilesManifest = {
    schemaVersion: 1,
    generator: 'dewey',
    files: Object.fromEntries(Object.entries(nextFiles).sort(([left], [right]) => left.localeCompare(right))),
  }
  const nextManifestContent = `${JSON.stringify(nextManifest, null, 2)}\n`
  const hasOwnedFiles = Object.keys(nextFiles).length > 0

  if (existingManifestContent !== null && !previousManifest) {
    operations.push({
      action: 'preserve',
      path: GENERATED_FILES_MANIFEST,
      scope: 'ownershipManifest',
      reason: 'existing ownership manifest is not a valid Dewey manifest',
    })
  } else if (hasOwnedFiles || existingManifestContent !== null) {
    operations.push({
      action: existingManifestContent === null ? 'create' : existingManifestContent === nextManifestContent ? 'unchanged' : 'update',
      path: GENERATED_FILES_MANIFEST,
      scope: 'ownershipManifest',
      content: nextManifestContent,
    })
  }

  const blockers = operations
    .filter(operation => operation.action === 'preserve' && desired.has(operation.path))
    .map(operation => `${operation.path}: ${operation.reason ?? 'ownership conflict'}`)
  if (existingManifestContent !== null && !previousManifest) {
    blockers.push(`${GENERATED_FILES_MANIFEST}: invalid ownership manifest`)
  }

  return {
    outputDir: resolvedOutput,
    operations: operations.sort(compareOperations),
    blocked: blockers.length > 0,
    blockers,
  }
}

export async function applyGenerationPlan(plan: GenerationPlan): Promise<void> {
  if (plan.blocked) {
    throw new Error(
      `Cannot generate until ownership conflicts are resolved:\n- ${plan.blockers.join('\n- ')}`,
    )
  }

  for (const operation of plan.operations) {
    await assertNoSymlinkComponents(plan.outputDir, operation.path)
    const filePath = join(plan.outputDir, operation.path)
    if (operation.action === 'delete') {
      await unlink(filePath)
      continue
    }
    if (operation.action !== 'create' && operation.action !== 'update') continue
    if (operation.content === undefined) throw new Error(`Missing generated content for ${operation.path}`)
    await mkdir(dirname(filePath), { recursive: true })
    await writeFile(filePath, operation.content)
  }
}

export function assertSafeArtifactPath(path: string): string {
  const normalizedPath = normalize(path).replace(/\\/g, '/')
  if (
    !path
    || isAbsolute(path)
    || normalizedPath === '..'
    || normalizedPath.startsWith('../')
    || normalizedPath.includes('/../')
  ) {
    throw new Error(`Generated artifact path must stay inside the output directory: ${path}`)
  }
  return normalizedPath.replace(/^\.\//, '')
}

function parseManifest(content: string | null): GeneratedFilesManifest | null {
  if (content === null) return null
  try {
    const parsed = JSON.parse(content) as Partial<GeneratedFilesManifest>
    if (parsed.schemaVersion !== 1 || parsed.generator !== 'dewey' || !parsed.files || typeof parsed.files !== 'object') {
      return null
    }
    for (const [path, value] of Object.entries(parsed.files)) {
      assertSafeArtifactPath(path)
      if (!value || typeof value.hash !== 'string' || !scopes.includes(value.scope)) return null
    }
    return parsed as GeneratedFilesManifest
  } catch {
    return null
  }
}

function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

async function assertNoSymlinkComponents(outputDir: string, artifactPath: string): Promise<void> {
  const safePath = assertSafeArtifactPath(artifactPath)
  let current = outputDir
  for (const segment of safePath.split('/')) {
    current = join(current, segment)
    try {
      const stats = await lstat(current)
      if (stats.isSymbolicLink()) {
        throw new Error(`Generated artifact path contains a symbolic link: ${artifactPath}`)
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return
      throw error
    }
  }
}

async function readOptionalFile(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf-8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}

function ensureTrailingNewline(content: string): string {
  return `${content.replace(/\s+$/, '')}\n`
}

function compareOperations(left: GenerationOperation, right: GenerationOperation): number {
  if (left.path === GENERATED_FILES_MANIFEST) return 1
  if (right.path === GENERATED_FILES_MANIFEST) return -1
  const actionOrder: Record<GenerationAction, number> = {
    delete: 0,
    create: 1,
    update: 2,
    preserve: 3,
    unchanged: 4,
  }
  return actionOrder[left.action] - actionOrder[right.action] || left.path.localeCompare(right.path)
}

export function isOutputInsideSource(sourceDir: string, outputDir: string): boolean {
  const path = relative(resolve(sourceDir), resolve(outputDir))
  return path === '' || (!path.startsWith('..') && !isAbsolute(path))
}
