import { Command } from 'commander'
import { version } from '../../package.json'
import { loadConfig } from '@/config/helpers.config'
import { Logs } from '@/logs'
import { createFileWatcher } from '@/watcher'

const program = new Command()

program
  .name('typesafe-query-keys')
  .description('Generate TypeScript types for query keys')
  .version(version)
  .option('-c, --config <path>', 'Path to the configuration file')
  .option('-w, --watch', 'Watch for file changes')
  .option('-o --once', 'Generate types once and exit')
  .parse(process.argv)

const options = program.opts()

async function main() {
  const configResult = await loadConfig(options.config)

  if (configResult.isErr()) {
    console.error(Logs.errorLoadingConfig(configResult.error))
    process.exit(1)
  }

  const config = configResult.value

  const fileWatcher = await createFileWatcher(
    process.cwd(),
    config,
  ).scanAndGenerate()

  if (!options.watch) return

  fileWatcher.start()
  // Handle graceful shutdown
  process.on('SIGINT', handleShutdown).on('SIGTERM', handleShutdown)

  function handleShutdown() {
    console.log(Logs.stoppingWatcher)
    fileWatcher.stop()
    process.exit(0)
  }
}
main()
