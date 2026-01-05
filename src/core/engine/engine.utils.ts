import * as Effect from 'effect/Effect'
import { FileSystem } from '@effect/platform/FileSystem'

import chokidar from 'chokidar'

import { WatcherError } from '@/core/errors'
import {
  CacheService,
  ConfigService,
  FileCollectorService,
  LoggerService,
} from '@/core/services'
import type { Config } from '@/core/services/config/config-schema'
import {
  enrichKeysWithParents,
  extractQueryKeys,
  hashString,
} from '@/core/utils'
import { writeQueryKeysToFile } from '@/core/writer/write-query-keys-to-file'
import { getMtime } from '../utils/fs'

export const processFile = (filePath: string) =>
  Effect.gen(function* () {
    const cache = yield* CacheService
    const logger = yield* LoggerService
    const fs = yield* FileSystem

    const mTime = yield* getMtime(filePath)

    if (!cache.hasMtimeChanged(filePath, mTime)) {
      logger.debug('Using cached data for:', filePath)
      return false
    }

    const content = yield* fs.readFileString(filePath, 'utf-8').pipe(
      Effect.catchAll((err) => {
        logger.error(`Failed to read file: ${filePath}, types maybe stale`, err)
        return Effect.succeed(null)
      }),
    )

    if (!content) return false

    const hash = yield* hashString(content)

    if (!cache.hasHashChanged(filePath, hash)) {
      logger.debug('Using cached data for:', filePath)
      return false
    }

    logger.debug('Scanning:', filePath)
    const keys = yield* extractQueryKeys({ filePath, content })

    if (!cache.haveKeysChanged(filePath, keys)) {
      logger.debug('Using cached data for:', filePath)
      return false
    }
    logger.debug(`Scanned[${keys.length}]:`, filePath)

    cache.set(filePath, { keys, hash, mTime })

    return true
  })

export const processAllFiles = () =>
  Effect.gen(function* () {
    const collector = yield* FileCollectorService
    const files = yield* collector.collectFiles().pipe(Effect.orDie)

    const results = yield* Effect.all(files.map(processFile), {
      concurrency: 'unbounded',
    })

    return results.some(Boolean)
  })

export const generateTypes = () =>
  Effect.gen(function* () {
    const config = yield* ConfigService
    const cache = yield* CacheService
    const logger = yield* LoggerService

    const allKeys = cache.collectAllKeys()
    const keysWithParents = enrichKeysWithParents(allKeys)
    const sortedKeys = [...keysWithParents].sort((a, b) => a.localeCompare(b))

    logger.debug('Writing query keys to file:', config.outputPath)

    yield* writeQueryKeysToFile({
      queryKeys: sortedKeys,
      outputPath: config.outputPath,
    })

    return sortedKeys.length
  })

export const createWatcher = (config: Config) =>
  Effect.try({
    try: () =>
      chokidar.watch(config.include.patterns, {
        cwd: config.rootDir,
        ignored: config.exclude.patterns,
        atomic: true,
        ignoreInitial: true,
      }),
    catch: (error) =>
      new WatcherError({ message: 'Failed to create watcher\n', cause: error }),
  })
