import ts from 'typescript'
import { readFile } from 'node:fs/promises'
import { posix } from 'node:path'

export const SYMBOL_FILE = /\.(?:[cm]?[jt]sx?)$/
// Names a doc may cite as path#name: top-level declarations, export aliases, and Class.member / Interface.member.
export function declarations(text: string, path: string): { names: Set<string>; reexports: string[] } {
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, false, path.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const names = new Set<string>()
  const reexports: string[] = []
  const members = (owner: string, list: ts.NodeArray<ts.ClassElement | ts.TypeElement>) => { for (const member of list) if (member.name && (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name))) names.add(`${owner}.${member.name.text}`) }
  const binding = (name: ts.BindingName) => { if (ts.isIdentifier(name)) names.add(name.text); else for (const element of name.elements) if (!ts.isOmittedExpression(element)) binding(element.name) }
  for (const statement of source.statements) {
    if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement) || ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement) || ts.isEnumDeclaration(statement) || ts.isModuleDeclaration(statement)) && statement.name && ts.isIdentifier(statement.name)) {
      names.add(statement.name.text)
      if (ts.isClassDeclaration(statement) || ts.isInterfaceDeclaration(statement)) members(statement.name.text, statement.members)
      if (ts.isEnumDeclaration(statement)) for (const member of statement.members) if (ts.isIdentifier(member.name)) names.add(`${statement.name.text}.${member.name.text}`)
    }
    if (ts.isVariableStatement(statement)) for (const declaration of statement.declarationList.declarations) binding(declaration.name)
    if (ts.isExportAssignment(statement)) names.add('default')
    if (ts.isExportDeclaration(statement)) {
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) for (const element of statement.exportClause.elements) names.add(element.name.text)
      else if (statement.exportClause && ts.isNamespaceExport(statement.exportClause)) names.add(statement.exportClause.name.text)
      else if (statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier) && statement.moduleSpecifier.text.startsWith('.')) reexports.push(statement.moduleSpecifier.text)
    }
  }
  return { names, reexports }
}
// Whether path declares name, following relative `export *` a few levels.
export async function hasSymbol(read: (path: string) => Promise<string | null>, path: string, name: string, depth = 0): Promise<boolean> {
  const text = await read(path)
  if (text === null) return false
  const { names, reexports } = declarations(text, path)
  if (names.has(name)) return true
  if (depth >= 4) return false
  for (const specifier of reexports) {
    const base = posix.join(posix.dirname(path), specifier).replace(/\.[cm]?js$/, '')
    for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].filter(file => SYMBOL_FILE.test(file))) {
      if (await read(candidate) !== null) { if (await hasSymbol(read, candidate, name, depth + 1)) return true; break }
    }
  }
  return false
}
export async function readText(path: string): Promise<string | null> { try { return await readFile(path, 'utf8') } catch { return null } }
