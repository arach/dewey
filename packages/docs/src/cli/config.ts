import { cosmiconfig } from 'cosmiconfig'
import { access } from 'fs/promises'
import { dirname, join } from 'path'
import { DeweyConfig } from './schema.js'

const SEARCH_PLACES = [
  'dewey.config.ts',
  'dewey.config.js',
  'dewey.config.mjs',
  'dewey.config.json',
  '.deweyrc',
  '.deweyrc.json',
]

const explorer = cosmiconfig('dewey', {
  searchPlaces: SEARCH_PLACES,
})

async function findConfigPath(searchFrom: string): Promise<string | null> {
  let directory = searchFrom
  while (true) {
    for (const place of SEARCH_PLACES) {
      const path = join(directory, place)
      try {
        await access(path)
        return path
      } catch {
        // Continue searching upward.
      }
    }
    const parent = dirname(directory)
    if (parent === directory) return null
    directory = parent
  }
}

/**
 * Load dewey configuration from the current directory
 */
export async function loadConfig(cwd: string = process.cwd()): Promise<DeweyConfig | null> {
  try {
    const result = await explorer.search(cwd)
    if (!result || result.isEmpty) return null
    return DeweyConfig.parse(result.config)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load dewey config: ${error.message}`)
    }
    throw error
  }
}

export interface LoadedDeweyConfig {
  config: DeweyConfig
  /** Directory containing the discovered Dewey configuration. */
  projectRoot: string
}

/**
 * Load Dewey configuration and preserve the project root it was discovered from.
 */
export async function loadConfigWithRoot(cwd: string = process.cwd()): Promise<LoadedDeweyConfig | null> {
  try {
    const configPath = await findConfigPath(cwd)
    if (!configPath) return null
    const result = await explorer.load(configPath)
    if (!result || result.isEmpty) {
      return null
    }

    return {
      config: DeweyConfig.parse(result.config),
      projectRoot: dirname(result.filepath),
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load dewey config: ${error.message}`)
    }
    throw error
  }
}

/**
 * Check if a dewey config exists
 */
export async function configExists(cwd: string = process.cwd()): Promise<boolean> {
  const result = await explorer.search(cwd)
  return result !== null && !result.isEmpty
}
