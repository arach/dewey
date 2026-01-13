import { cosmiconfig } from 'cosmiconfig'
import { DeweyConfig } from './schema.js'

const explorer = cosmiconfig('dewey', {
  searchPlaces: [
    'dewey.config.ts',
    'dewey.config.js',
    'dewey.config.mjs',
    'dewey.config.json',
    '.deweyrc',
    '.deweyrc.json',
  ],
})

/**
 * Load dewey configuration from the current directory
 */
export async function loadConfig(cwd: string = process.cwd()): Promise<DeweyConfig | null> {
  try {
    const result = await explorer.search(cwd)
    if (!result || result.isEmpty) {
      return null
    }

    return DeweyConfig.parse(result.config)
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
