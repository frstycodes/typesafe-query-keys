import { existsSync } from 'fs'
import { resolve } from 'path'
import { codemods } from '../../codemods/index.js'
import { CodemodLogs } from './codemod.logs.js'

interface CodemodOptions {
  dry?: boolean
  dryRun?: boolean
  print?: boolean
  parser?: string
  extensions?: string
  verbose?: boolean
}

export async function runCodemod(
  name: string,
  path: string,
  options: CodemodOptions,
) {
  const isDryRun = options.dry || options.dryRun

  const codemod = codemods[name]

  if (!codemod) {
    CodemodLogs.UnknownCodemod(name)
    process.exit(1)
  }

  const targetPath = resolve(process.cwd(), path)

  if (!existsSync(targetPath)) {
    console.error(`\n❌ Target path not found: ${targetPath}\n`)
    process.exit(1)
  }

  CodemodLogs.RunningCodeMod(
    codemod.name,
    codemod.description,
    targetPath,
    options.extensions,
  )

  isDryRun ? CodemodLogs.DryRunStart() : CodemodLogs.NotDryRunStart()

  try {
    const result = await codemod.transform([targetPath], {
      extensions: options.extensions || 'ts,tsx',
      dry: isDryRun,
      verbose: options.verbose || false,
    })

    if (result.error > 0) {
      console.error(`\n❌ Codemod failed with ${result.error} error(s)\n`)
      process.exit(1)
    }

    CodemodLogs.Result(result)

    if (result.ok == 0) return CodemodLogs.ZeroOk()
    CodemodLogs.CodemodCompleted()

    if (isDryRun) return CodemodLogs.DryRun(name, targetPath)
    CodemodLogs.NoDryRun()
  } catch (error) {
    console.error('\n❌ Failed to run codemod:', error)
    process.exit(1)
  }
}
