import fs from 'fs'
import path from 'path'
import type { Plugin, PluginOption } from 'vite'
import Package from '../../package.json'
import { collectPatterns, generateTypeDefinitions } from '../codegen'
import { ConfigInsert } from '../config'
import { parseConfig } from '../config/helpers'
import { hashFile } from '../utils/crypto'
import { createLogger } from '../utils/logger'

const PLUGIN_NAME = Package.name + '-vite-plugin'
// Store the hash of the last file we generated to avoid infinite loops
let lastGeneratedFileHash: string | null = null

export function typesafeQueryKeysPlugin(
  options: ConfigInsert = {},
): PluginOption {
  const logger = createLogger(!!options.verbose, !!options.verbose)

  const plugin = {
    name: PLUGIN_NAME,

    async buildStart() {
      // Validate the config
      const configResult = await parseConfig(options)

      if (configResult.isErr()) throw configResult.error

      const config = configResult.value

      logger('info', '🔍 Scanning for query keys...')
      const patternsResult = await collectPatterns(
        config.include,
        config.exclude,
      )

      if (patternsResult.isErr()) throw patternsResult.error

      const genResult = generateTypeDefinitions(
        patternsResult.value,
        config.outputFile,
      )

      if (genResult.isErr()) throw genResult.error

      // Store the hash returned from the generation function
      lastGeneratedFileHash = genResult.value

      logger('info', '✅ Types generated successfully')
    },

    async configureServer(server) {
      const watcher = server.watcher

      // Validate the config
      const configResult = await parseConfig(options)

      if (configResult.isErr()) {
        return void server.config.logger.error(
          `❌ Configuration error: ${configResult.error.message}`,
        )
      }

      const config = configResult.value

      let isProcessing = false
      let pendingRegeneration = false

      async function onChange(changedPath: string) {
        // Check if the changed file should be ignored
        const skipif =
          !fs.existsSync(changedPath) || // Skip if the file doesn't exist
          !fs.statSync(changedPath).isFile() || // Skip if the path is not a file
          matchesAnyGlob(changedPath, config.exclude) || // Skip if the path matches any exclude pattern
          !matchesAnyGlob(changedPath, config.include) // Skip if the path doesn't match any include pattern

        if (skipif) return

        // If this is the output file, check if it was modified by our own code
        if (path.resolve(changedPath) === path.resolve(config.outputFile)) {
          try {
            const content = fs.readFileSync(changedPath, 'utf8')
            const currentHash = hashFile(content)

            // Skip if this is our own file generation (hash matches)
            if (currentHash === lastGeneratedFileHash) return
          } catch (error) {
            // If we can't read the file, just proceed with regeneration
          }
        }

        // Debounce rapid changes
        if (isProcessing) {
          pendingRegeneration = true
          return
        }

        isProcessing = true

        logger('info', '🔄 Regenerating types for', changedPath)
        const patternsResult = await collectPatterns(
          config.include,
          config.exclude,
        )

        if (patternsResult.isErr()) {
          server.config.logger.error(
            `❌ Failed to collect patterns for ${changedPath}: ${patternsResult.error.message}`,
          )
        } else {
          const genResult = generateTypeDefinitions(
            patternsResult.value,
            config.outputFile,
          )

          if (genResult.isErr()) {
            server.config.logger.error(
              `❌ Failed to generate definitions for ${changedPath}: ${genResult.error.message}`,
            )
          } else {
            logger('info', '✅ Types regenerated successfully')

            // Store the hash returned from the generation function
            lastGeneratedFileHash = genResult.value
          }
        }

        isProcessing = false

        // Handle pending regeneration
        if (pendingRegeneration) {
          pendingRegeneration = false
          setTimeout(() => onChange(changedPath), 100)
        }
      }

      // Watch for file changes
      watcher.on('add', onChange)
      watcher.on('change', onChange)
      watcher.on('unlink', onChange)

      watcher.add(config.outputFile)

      logger('info', '\n🚀 Watching for file changes...')
    },
  } satisfies Plugin

  return plugin
}

function matchesAnyGlob(filePath: string, globs: string[]): boolean {
  const relative = path.relative(process.cwd(), filePath)
  const normalized = relative.replace(/\\/g, '/')

  return globs.some((g) => path.matchesGlob(normalized, g))
}
