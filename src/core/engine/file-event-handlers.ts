import { FileSystem } from '@effect/platform'
import { Effect } from 'effect'

import {
  CacheService,
  FileCollectorService,
  LoggerService,
} from '@/core/services'
import { processFile } from './engine.utils'

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
    const fs = yield* FileSystem.FileSystem

    const path = event.path

    const exists = yield* fs.exists(path)

    if (event._tag === 'Unlink' || !exists) {
      return yield* handleFileRemoval(path)
    }

    const shouldProcess = yield* collector.shouldProcess(path)

    if (!shouldProcess) {
      const fileExists = cache.get(path)
      if (fileExists) return yield* handleFileRemoval(path)
      return false
    }

    logger.debug('File changed:', path)

    const shouldGenerate = yield* processFile(path)
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
