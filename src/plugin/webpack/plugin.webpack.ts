import { Config } from '@/config/schema.config'
import { createFileWatcher } from '@/watcher'
import { WebpackPluginInstance } from 'webpack'
import { name as PackageName } from '../../../package.json'
import { singleton } from '@/utils/singleton'

const PLUGIN_NAME = PackageName + '/webpack-plugin'

function plugin(opts = {} as Config.Input) {
  let watcher: ReturnType<typeof createFileWatcher>

  return {
    apply(compiler) {
      if (compiler.options.mode != 'development') return

      compiler.hooks.watchRun.tap(PLUGIN_NAME, async () => {
        if (!watcher) {
          const config = await Config.parseAsync(opts)
          watcher = createFileWatcher(process.cwd(), config)
          watcher.scanAndGenerate()
          watcher.start()
        }
      })

      compiler.hooks.watchClose.tap(PLUGIN_NAME, async () => {
        watcher?.stop()
      })
    },
  } satisfies WebpackPluginInstance
}

/// Export as a singleton so only one instance is created
export const typesafeQueryKeysPluginWebpack = singleton(plugin)
