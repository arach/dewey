import { createHash } from 'crypto'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

export interface DeweyManifestFile {
  owner: 'dewey' | 'consumer' | 'ejected'
  hash?: string
  version?: string
  component?: string
  mode?: 'wrap' | 'full'
}

export interface DeweyManifest {
  deweyVersion: string
  createdAt: string
  updatedAt: string
  /** Framework scaffold (nextjs, astro, subpath). */
  scaffold: 'nextjs' | 'astro' | 'subpath'
  /** Structural layout template (hudson, rail, centered, command). */
  templateId?: string
  /** Color theme preset. */
  themeId?: string
  /** @deprecated use scaffold */
  template?: 'nextjs' | 'astro' | 'subpath'
  /** @deprecated use themeId */
  theme?: string
  projectName: string
  defaultPage: string
  /** Docs source directory relative to project root (subpath template) */
  docsDir?: string
  /** Base URL path for docs routes (subpath template) */
  basePath?: string
  files: Record<string, DeweyManifestFile>
}

export const MANIFEST_FILENAME = '.dewey-manifest.json'

export function getManifestScaffold(m: DeweyManifest): 'nextjs' | 'astro' | 'subpath' {
  return m.scaffold ?? m.template ?? 'nextjs'
}

export function getManifestThemeId(m: DeweyManifest): string {
  return m.themeId ?? m.theme ?? 'neutral'
}

export function getManifestTemplateId(m: DeweyManifest): string {
  return m.templateId ?? 'hudson'
}

export function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

export async function readManifest(dir: string): Promise<DeweyManifest | null> {
  try {
    const raw = await readFile(join(dir, MANIFEST_FILENAME), 'utf-8')
    return JSON.parse(raw) as DeweyManifest
  } catch {
    return null
  }
}

export async function writeManifest(dir: string, manifest: DeweyManifest): Promise<void> {
  await writeFile(
    join(dir, MANIFEST_FILENAME),
    JSON.stringify(manifest, null, 2) + '\n',
  )
}
