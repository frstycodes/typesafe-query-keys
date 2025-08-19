#!/usr/bin/env node

import chokidar from 'chokidar'
import { Command } from 'commander'
import fs from 'fs'
import path from 'path'
import { collectPatterns, generateTypeDefinitions } from '../codegen'
import { loadConfig } from '../config/helpers'
import { hashFile } from '../utils/crypto'
import { createLogger } from '../utils/logger'
import { glob } from 'glob'
import Lib from '../../package.json'

const program = new Command()

program
  .name('typesafe-query-keys')
  .description('Generate TypeScript types for query keys')
  .version(Lib.version)
  .option('-w, --watch', 'Watch for file changes', false)
  .option('--once', 'Generate types once and exit', false)
  .parse(process.argv)

const options = program.opts()
// Store the hash of the last file we generated to avoid infinite loops
let lastGeneratedFileHash: string | null = null

async function main() {
  // Load configuration
  const configResult = await loadConfig()

  if (configResult.isErr()) {
    console.error('❌ Error loading configuration:', configResult.error)
    process.exit(1)
  }

  const config = configResult.value

  const logger = createLogger(config.verbose, config.verbose)

  if (options.once) {
    // Generate types once
    logger('info', '🔍 Scanning for query key patterns...')
    const patternsResult = await collectPatterns(config.include, config.exclude)

    if (patternsResult.isErr()) {
      logger('error', '❌ Error collecting patterns:', patternsResult.error)
      process.exit(1)
      return
    }

    const genResult = generateTypeDefinitions(
      patternsResult.value,
      config.outputFile,
    )

    if (genResult.isErr()) {
      logger('error', '❌ Error generating type definitions:', genResult.error)
      process.exit(1)
      return
    }

    // Store the hash returned from the generation function
    lastGeneratedFileHash = genResult.value

    return
  }

  if (options.watch) {
    // Initial generation
    logger('info', '🔍 Initial scan for query key patterns...')
    const initialPatternsResult = await collectPatterns(
      config.include,
      config.exclude,
    )

    if (initialPatternsResult.isErr()) {
      logger(
        'error',
        '❌ Error collecting initial patterns:',
        initialPatternsResult.error,
      )
      process.exit(1)
      return
    }

    const initialGenResult = generateTypeDefinitions(
      initialPatternsResult.value,
      config.outputFile,
    )

    if (initialGenResult.isErr()) {
      logger(
        'error',
        '❌ Error generating initial type definitions:',
        initialGenResult.error,
      )
      process.exit(1)
    }

    // Store the hash returned from the generation function
    lastGeneratedFileHash = initialGenResult.value

    const watchFiles = await glob(config.include, { ignore: config.exclude })
    const watcher = chokidar.watch(watchFiles, {
      persistent: true,
      ignoreInitial: true,
      alwaysStat: true,
    })

    let isProcessing = false
    let pendingRegeneration = false

    // Watch events
    watcher
      .on('add', regenerateTypes)
      .on('change', regenerateTypes)
      .on('unlink', regenerateTypes)
      .on('error', (err) => logger('error', '❌ Watcher error:', err))

    async function regenerateTypes(changedFile?: string) {
      if (isProcessing) {
        pendingRegeneration = true
        return
      }

      // If this is the output file, check if it was modified by our own code
      if (
        changedFile &&
        path.resolve(changedFile) === path.resolve(config.outputFile)
      ) {
        try {
          const content = fs.readFileSync(changedFile, 'utf8')
          const currentHash = hashFile(content)

          // Skip if this is our own file generation (hash matches)
          if (currentHash === lastGeneratedFileHash) return
        } catch (error) {
          // If we can't read the file, just proceed with regeneration
        }
      }

      isProcessing = true

      if (changedFile) {
        logger('info', `🔄 Regenerating types for ${changedFile}`)
      } else {
        logger('info', '🔄 Regenerating types...')
      }

      const patternsResult = await collectPatterns(
        config.include,
        config.exclude,
      )

      if (patternsResult.isErr()) {
        logger('error', '❌ Failed to collect patterns:', patternsResult.error)
      } else {
        const genResult = generateTypeDefinitions(
          patternsResult.value,
          config.outputFile,
        )

        if (genResult.isErr()) {
          logger(
            'error',
            '❌ Failed to generate type definitions:',
            genResult.error,
          )
        } else {
          // Store the hash returned from the generation function
          lastGeneratedFileHash = genResult.value
        }
      }

      isProcessing = false

      // Handle pending regeneration
      if (pendingRegeneration) {
        pendingRegeneration = false
        setTimeout(() => regenerateTypes(), 100)
      }
    }

    logger('info', '🚀 Watching for file changes...\n')

    // Handle graceful shutdown
    process.on('SIGINT', handleShutdown).on('SIGTERM', handleShutdown)
    function handleShutdown() {
      logger('info', '\n🛑 Stopping watcher...')
      watcher.close()
      process.exit(0)
    }
  } else {
    // Default: generate once
    logger('info', '🔍 Scanning for query key patterns...')
    const patternsResult = await collectPatterns(config.include, config.exclude)

    if (patternsResult.isErr()) {
      logger('error', '❌ Error collecting patterns:', patternsResult.error)
      process.exit(1)
      return
    }

    const genResult = generateTypeDefinitions(
      patternsResult.value,
      config.outputFile,
    )

    if (genResult.isErr()) {
      logger('error', '❌ Error generating type definitions:', genResult.error)
      process.exit(1)
      return
    }
  }
}

main()
