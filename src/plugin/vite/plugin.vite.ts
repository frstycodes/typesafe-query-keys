import { Config } from '@/config/schema.config'
import { createFileWatcher } from '@/watcher'
import type { Plugin, PluginOption } from 'vite'
import { name as PackageName } from '../../../package.json'

const PLUGIN_NAME = PackageName + '/vite-plugin'

export function typesafeQueryKeysPluginVite(
  opts: Config.Input = {},
): PluginOption {
  const fileWatcherPromise = Config.parseAsync(opts).then((config) =>
    createFileWatcher(process.cwd(), config),
  )

  return {
    name: PLUGIN_NAME,

    buildStart: async () => {
      const watcher = await fileWatcherPromise
      watcher.scanAndGenerate()
    },

    configureServer: async (server) => {
      const watcher = await fileWatcherPromise
      watcher.start(server.watcher)
    },
  } satisfies Plugin
}
