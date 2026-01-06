import { Command } from 'commander'
import { runCodemod } from './commands/codemod.js'
import { codemods } from '../codemods/index.js'

const program = new Command()

program
  .name('@frsty/typesafe-query-keys')
  .description('CLI for @frsty/typesafe-query-keys')
  .version('2.1.0-beta.0')

program
  .command('codemod <name> [path]')
  .description('Run a codemod to migrate your codebase')
  .option('-d, --dry', 'Dry run (no changes will be made)')
  .option('--dry-run', 'Alias for --dry')
  .option('-p, --print', 'Print transformed files to stdout')
  .option('--parser <parser>', 'Parser to use (tsx, babel, ts, flow)')
  .option(
    '--extensions <extensions>',
    'File extensions to transform (comma-separated)',
  )
  .option('-v, --verbose', 'Show more information')
  .action((name, path = 'src', options) => {
    runCodemod(name, path, options).catch((error) => {
      console.error(error)
      process.exit(1)
    })
  })

program
  .command('list-codemods')
  .alias('list')
  .description('List all available codemods')
  .action(() => {
    console.log('\n📦 Available codemods:\n')
    Object.values(codemods).forEach((codemod) => {
      console.log(
        `  ${codemod.name.padEnd(20)} ${codemod.description} (v${codemod.version})`,
      )
    })
    console.log('\n💡 Usage:')
    console.log('  npx @frsty/typesafe-query-keys codemod <name> [path]\n')
    console.log('Example:')
    console.log('  npx @frsty/typesafe-query-keys codemod slash-to-dot src/\n')
  })

program.parse()
