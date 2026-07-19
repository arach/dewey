import { access, readdir, readFile } from 'fs/promises'
import { extname, join, relative, resolve, sep } from 'path'

export interface DriftDocument {
  path: string
  body: string
}

export type DriftIssueCode =
  | 'MISSING_AGENT_COUNTERPART'
  | 'ORPHAN_AGENT_DOCUMENT'
  | 'MISSING_SOURCE_REFERENCE'
  | 'AGENT_CONTRACT_MISSING'
  | 'HUMAN_AGENT_CONTRACT_MISMATCH'
  | 'DOC_SOURCE_CONTRACT_MISMATCH'

export interface DriftIssue {
  code: DriftIssueCode
  message: string
  document: string
  counterpart?: string
  sourcePath?: string
  symbol?: string
  expected?: string[]
  actual?: string[]
}

export interface DriftReport {
  status: 'clean' | 'issues' | 'not-applicable'
  checkedPairs: number
  checkedSourceFiles: number
  checkedSourceReferences: number
  checkedContracts: number
  issues: DriftIssue[]
}

interface ContractDeclaration {
  symbol: string
  values: string[]
  path: string
}

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.swift'])
const IGNORED_DIRECTORIES = new Set([
  '.git',
  '.next',
  '.turbo',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'test',
  'tests',
  '__tests__',
])

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

function isHumanPage(path: string): boolean {
  const segments = path.split('/')
  const filename = segments[segments.length - 1] ?? ''
  return filename.endsWith('.md')
    && !filename.endsWith('.agent.md')
    && filename.toLowerCase() !== 'agents.md'
    && !segments.slice(0, -1).some(segment => ['agent', 'prompts'].includes(segment.toLowerCase()))
}

function counterpartPaths(path: string): string[] {
  const id = path.replace(/\.md$/, '')
  return [`${id}.agent.md`, `agent/${id}.agent.md`]
}

function sortedValues(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

function extractQuotedValues(content: string): string[] {
  return sortedValues([...content.matchAll(/['"]([^'"]+)['"]/g)].map(match => match[1]))
}

function extractContracts(content: string, path: string): ContractDeclaration[] {
  const contracts: ContractDeclaration[] = []

  for (const match of content.matchAll(/\b(?:export\s+)?type\s+([A-Za-z_$][\w$]*)\s*=\s*([^;\n]+)/g)) {
    const values = extractQuotedValues(match[2])
    if (values.length >= 2 && match[2].includes('|')) {
      contracts.push({ symbol: match[1], values, path })
    }
  }

  for (const match of content.matchAll(/\b(?:export\s+)?enum\s+([A-Za-z_$][\w$]*)[^\{]*\{([\s\S]*?)\}/g)) {
    const values = extractQuotedValues(match[2])
    if (values.length > 0) {
      contracts.push({ symbol: match[1], values, path })
    }
  }

  for (const match of content.matchAll(/\benum\s+([A-Za-z_$][\w$]*)\s*:\s*String\s*\{([\s\S]*?)\}/g)) {
    const values: string[] = []
    for (const caseMatch of match[2].matchAll(/\bcase\s+([A-Za-z_$][\w$]*)(?:\s*=\s*"([^"]+)")?/g)) {
      values.push(caseMatch[2] ?? caseMatch[1])
    }
    if (values.length > 0) {
      contracts.push({ symbol: match[1], values: sortedValues(values), path })
    }
  }

  return contracts
}

function valuesEqual(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

function extractSourceReferences(content: string): string[] {
  const references = [...content.matchAll(/`((?:src|lib|packages|apps|Sources)\/[\w.-][\w./-]*)`/g)]
    .filter(match => {
      const context = content.slice(Math.max(0, (match.index ?? 0) - 90), match.index)
      return /\b(source|implementation|entry point|defined|located|lives|see|check|inspect)\b/i.test(context)
    })
    .map(match => match[1].replace(/:\d+(?::\d+)?$/, ''))
  return sortedValues(references)
}

async function collectFiles(path: string, output: Set<string>): Promise<void> {
  if (!await fileExists(path)) return

  const entries = await readdir(path, { withFileTypes: true })
  for (const entry of entries) {
    const absolutePath = join(path, entry.name)
    if (entry.isDirectory()) {
      if (!IGNORED_DIRECTORIES.has(entry.name)) await collectFiles(absolutePath, output)
    } else if (entry.isFile() && SOURCE_EXTENSIONS.has(extname(entry.name))) {
      output.add(absolutePath)
    }
  }
}

async function collectSourceFiles(projectRoot: string, configuredPaths: string[]): Promise<string[]> {
  const files = new Set<string>()

  for (const path of ['src', 'lib', 'Sources']) {
    await collectFiles(join(projectRoot, path), files)
  }

  for (const parentName of ['packages', 'apps']) {
    const parent = join(projectRoot, parentName)
    if (!await fileExists(parent)) continue
    const entries = await readdir(parent, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      await collectFiles(join(parent, entry.name, 'src'), files)
      await collectFiles(join(parent, entry.name, 'Sources'), files)
    }
  }

  for (const configuredPath of configuredPaths) {
    const absolutePath = resolve(projectRoot, configuredPath)
    if (!absolutePath.startsWith(`${resolve(projectRoot)}${sep}`) && absolutePath !== resolve(projectRoot)) continue
    if (SOURCE_EXTENSIONS.has(extname(absolutePath)) && await fileExists(absolutePath)) {
      files.add(absolutePath)
    } else {
      await collectFiles(absolutePath, files)
    }
  }

  return [...files].sort((a, b) => a.localeCompare(b))
}

function sourcePath(projectRoot: string, absolutePath: string): string {
  return relative(projectRoot, absolutePath).split(sep).join('/')
}

export async function analyzeDocumentationDrift(options: {
  projectRoot: string
  documents: DriftDocument[]
  configuredSourcePaths?: string[]
}): Promise<DriftReport> {
  const { projectRoot, documents } = options
  const humanDocuments = documents.filter(document => isHumanPage(document.path))
  const documentMap = new Map(documents.map(document => [document.path, document]))
  const issues: DriftIssue[] = []
  let checkedPairs = 0
  let checkedSourceReferences = 0
  let checkedContracts = 0

  const sourceFiles = await collectSourceFiles(projectRoot, options.configuredSourcePaths ?? [])
  const sourceContracts: ContractDeclaration[] = []
  for (const absolutePath of sourceFiles) {
    const path = sourcePath(projectRoot, absolutePath)
    sourceContracts.push(...extractContracts(await readFile(absolutePath, 'utf8'), path))
  }
  const sourceContractsBySymbol = new Map<string, ContractDeclaration[]>()
  for (const contract of sourceContracts) {
    const existing = sourceContractsBySymbol.get(contract.symbol) ?? []
    existing.push(contract)
    sourceContractsBySymbol.set(contract.symbol, existing)
  }

  for (const document of humanDocuments) {
    const counterpartPath = counterpartPaths(document.path).find(path => documentMap.has(path))
    const counterpart = counterpartPath ? documentMap.get(counterpartPath) : undefined
    if (!counterpart || !counterpartPath) {
      issues.push({
        code: 'MISSING_AGENT_COUNTERPART',
        message: `${document.path} has no paired .agent.md counterpart`,
        document: document.path,
      })
    } else {
      checkedPairs += 1
      const humanContracts = extractContracts(document.body, document.path)
      const agentContracts = extractContracts(counterpart.body, counterpart.path)
      const agentContractsBySymbol = new Map(agentContracts.map(contract => [contract.symbol, contract]))

      for (const contract of humanContracts) {
        checkedContracts += 1
        const agentContract = agentContractsBySymbol.get(contract.symbol)
        if (!agentContract) {
          issues.push({
            code: 'AGENT_CONTRACT_MISSING',
            message: `${counterpart.path} omits the ${contract.symbol} value contract documented by ${document.path}`,
            document: document.path,
            counterpart: counterpart.path,
            symbol: contract.symbol,
            expected: contract.values,
          })
        } else if (!valuesEqual(contract.values, agentContract.values)) {
          issues.push({
            code: 'HUMAN_AGENT_CONTRACT_MISMATCH',
            message: `${contract.symbol} values differ between ${document.path} and ${counterpart.path}`,
            document: document.path,
            counterpart: counterpart.path,
            symbol: contract.symbol,
            expected: contract.values,
            actual: agentContract.values,
          })
        }
      }
    }

  }

  const expectedCounterparts = new Set(humanDocuments.flatMap(document => counterpartPaths(document.path)))
  for (const document of documents) {
    const isAgentDocument = document.path.endsWith('.agent.md')
      || document.path.split('/').slice(0, -1).some(segment => segment.toLowerCase() === 'agent')
    if (isAgentDocument && !expectedCounterparts.has(document.path)) {
      issues.push({
        code: 'ORPHAN_AGENT_DOCUMENT',
        message: `${document.path} has no human .md source page`,
        document: document.path,
      })
    }

    for (const reference of extractSourceReferences(document.body)) {
      checkedSourceReferences += 1
      if (!await fileExists(join(projectRoot, reference))) {
        issues.push({
          code: 'MISSING_SOURCE_REFERENCE',
          message: `${document.path} references missing source path ${reference}`,
          document: document.path,
          sourcePath: reference,
        })
      }
    }

    for (const contract of extractContracts(document.body, document.path)) {
      const candidates = sourceContractsBySymbol.get(contract.symbol)
      if (!candidates || candidates.length === 0) continue
      checkedContracts += 1
      if (!candidates.some(candidate => valuesEqual(contract.values, candidate.values))) {
        const source = candidates[0]
        issues.push({
          code: 'DOC_SOURCE_CONTRACT_MISMATCH',
          message: `${contract.symbol} values in ${document.path} differ from ${source.path}`,
          document: document.path,
          sourcePath: source.path,
          symbol: contract.symbol,
          expected: source.values,
          actual: contract.values,
        })
      }
    }
  }

  issues.sort((a, b) =>
    a.document.localeCompare(b.document)
      || a.code.localeCompare(b.code)
      || (a.symbol ?? '').localeCompare(b.symbol ?? ''),
  )

  const applicable = humanDocuments.length > 0
  return {
    status: issues.length > 0 ? 'issues' : !applicable ? 'not-applicable' : 'clean',
    checkedPairs,
    checkedSourceFiles: sourceFiles.length,
    checkedSourceReferences,
    checkedContracts,
    issues,
  }
}
