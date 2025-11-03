import { Config } from '@/config/schema.config'
import { createFileWatcher } from '@/watcher'
import type { Plugin, PluginOption } from 'vite'
import Lib from '../../package.json'

const PLUGIN_NAME = Lib.name + '/vite-plugin'

export function typesafeQueryKeysPlugin(options = {}): PluginOption {
  return {
    name: PLUGIN_NAME,

    buildStart: async () => {
      const config = await Config.parseAsync(options)
      createFileWatcher(process.cwd(), config).scanAndGenerate()
    },

    configureServer: async (server) => {
      const config = await Config.parseAsync(options)
      createFileWatcher(process.cwd(), config).start(server.watcher)
    },
  } satisfies Plugin
}
