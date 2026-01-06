import { codemods } from '@/codemods'
import { TransformResult } from '@/codemods/types'

export const CodemodLogs = {
  RunningCodeMod(
    name: string,
    description: string,
    targetPath: string,
    extensions?: string,
  ) {
    console.log(
      `\n🔧 Running codemod: ${name}` +
        `📝 ${description}` +
        `📁 Target: ${targetPath}` +
        `📄 Extensions: ${extensions || 'ts,tsx'}`,
    )
  },

  Result(result: TransformResult) {
    console.log(
      `\n📊 Results:\n` +
        `  ✅ ${result.ok} file(s) modified\n` +
        `  ⏩  ${result.nochange} file(s) unchanged\n` +
        `  ⚠️  ${result.skip} file(s) skipped`,
    )
  },

  ZeroOk() {
    console.log(
      '\nℹ️  No files were modified. This could mean:\n' +
        '  - Files already use the new syntax\n' +
        '  - No matching patterns were found\n' +
        '  - Target path contains no files matching the extensions\n',
    )
  },

  DryRunStart() {
    console.log('🔍 Mode: Dry run (no files will be modified)\n')
  },

  NotDryRunStart() {
    console.log('✏️  Mode: Files will be modified\n')
  },

  NoDryRun() {
    console.log(
      '\nℹ️  No files were modified. This could mean:\n' +
        '  1. Review changes: git diff\n' +
        '  2. Run your tests: npm test\n' +
        '  3. Commit changes: git add . && git commit -m "Migrate to v2.1.0"\n',
    )
  },

  DryRun(name: string, path: string) {
    console.log(
      'To apply changes, run without --dry flag:\n' +
        `  npx @frsty/typesafe-query-keys codemod ${name} ${path}\n`,
    )
  },

  CodemodCompleted() {
    console.log('\n✅ Codemod completed successfully!\n')
  },

  UnknownCodemod(name: string) {
    const codemodsStr = Object.values(codemods)
      .map((codemod) => {
        return `  - ${codemod.name}: ${codemod.description} (v${codemod.version})`
      })
      .join('\n')

    console.error(`\n❌ Unknown codemod: "${name}"\n`)
    console.log(
      'Available codemods:\n' +
        codemodsStr +
        '\nRun: npx @frsty/typesafe-query-keys list-codemods\n',
    )
  },
}
