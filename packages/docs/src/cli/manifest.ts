import { createHash } from 'crypto'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

export interface DeweyManifestFile {
  owner: 'dewey' | 'consumer'
  hash?: string
  version?: string
}

export interface DeweyManifest {
  deweyVersion: string
  createdAt: string
  updatedAt: string
  template: 'astro' | 'nextjs'
  theme: string
  projectName: string
  defaultPage: string
  files: Record<string, DeweyManifestFile>
}

export const MANIFEST_FILENAME = '.dewey-manifest.json'

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
