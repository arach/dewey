import chalk from 'chalk'
import { cosmiconfig } from 'cosmiconfig'
import { ZodError } from 'zod'
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

function formatZodError(error: ZodError): string {
  const header = chalk.red.bold('✖ Invalid dewey config\n')

  const issues = error.issues.map((issue) => {
    const path = issue.path.length > 0
      ? chalk.yellow(issue.path.join('.'))
      : chalk.yellow('(root)')
    return `  ${chalk.red('→')} ${path}${chalk.dim(':')} ${issue.message}`
  })

  const hint = chalk.dim('\n  See https://github.com/arach/dewey#configuration for the expected schema.')

  return `${header}${issues.join('\n')}${hint}`
}

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
    if (error instanceof ZodError) {
      console.error(formatZodError(error))
      process.exit(1)
    }
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
