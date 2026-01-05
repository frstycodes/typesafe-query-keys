import { FileSystem } from '@effect/platform/FileSystem'
import * as Effect from 'effect/Effect'

import {
  CacheService,
  ConfigService,
  FileCollectorService,
  LoggerService,
} from '@/core/services'
import { processFile } from './engine.utils'
import { Path } from '@effect/platform/Path'

export type FileChangeEvent = {
  _tag: 'Add' | 'Change' | 'Unlink'
  path: string
}

/**
 * Handles a file change event and returns whether types should be regenerated.
 * Does NOT generate types itself - that's done in batches by the engine.
 */
export const handleFileEvent = (event: FileChangeEvent) =>
  Effect.gen(function* () {
    const cache = yield* CacheService
    const collector = yield* FileCollectorService
    const logger = yield* LoggerService
    const config = yield* ConfigService

    const fs = yield* FileSystem
    const path = yield* Path

    const filePath = path.resolve(config.rootDir, event.path)

    const exists = yield* fs.exists(filePath)

    if (event._tag === 'Unlink' || !exists) {
      return yield* handleFileRemoval(filePath)
    }

    const shouldProcess = yield* collector.shouldProcess(filePath)

    if (!shouldProcess) {
      const fileExists = cache.get(filePath)
      if (fileExists) return yield* handleFileRemoval(filePath)
      return false
    }

    logger.debug('File changed:', filePath)

    const shouldGenerate = yield* processFile(filePath)
    return shouldGenerate
  }).pipe(
    Effect.catchTag('SystemError', 'BadArgument', (error) =>
      Effect.gen(function* () {
        const logger = yield* LoggerService
        logger.error(
          `Error processing file: ${event.path}. Types maybe stale`,
          error,
        )
        return false
      }),
    ),
  )

const handleFileRemoval = (filePath: string) =>
  Effect.gen(function* () {
    const cache = yield* CacheService
    const logger = yield* LoggerService

    if (!cache.get(filePath)) return false

    logger.debug('File deleted:', filePath)
    cache.delete(filePath)
    return true
  })
