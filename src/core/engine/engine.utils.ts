import { FileSystem } from '@effect/platform'
import chokidar from 'chokidar'
import { Effect, Option } from 'effect'

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

export const processFile = (filePath: string) =>
  Effect.gen(function* () {
    const cache = yield* CacheService
    const logger = yield* LoggerService
    const fs = yield* FileSystem.FileSystem

    const mTime = yield* fs.stat(filePath).pipe(
      Effect.map((s) => Option.getOrElse(s.mtime, () => new Date(0)).getTime()),
      Effect.catchAll((error) => {
        logger.warn('Failed to get file mtime, using default value 0', error)
        return Effect.succeed(0)
      }),
    )

    const hasMTimeChanged = cache.hasMtimeChanged(filePath, mTime)
    if (!hasMTimeChanged) {
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

    const hasHashChanged = cache.hasHashChanged(filePath, hash)
    if (!hasHashChanged) {
      logger.debug('Using cached data for:', filePath)
      return false
    }

    const keys = yield* extractQueryKeys({
      filePath,
      sourceText: content,
    })

    logger.debug(`Scanned ${filePath}: found ${keys.length} keys`)

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

    const allKeys = cache.collectAllKeys()
    const keysWithParents = enrichKeysWithParents(allKeys)
    const sortedKeys = [...keysWithParents].sort((a, b) => a.localeCompare(b))

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
        ignored: config.exclude.patterns,
        atomic: true,
        ignoreInitial: true,
      }),
    catch: (error) =>
      new WatcherError({ message: 'Failed to create watcher\n', cause: error }),
  })
