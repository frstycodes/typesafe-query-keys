import * as Effect from 'effect/Effect'
import * as Option from 'effect/Option'
import { FileSystem } from '@effect/platform/FileSystem'

import { LoggerService } from '../services'

export const getMtime = (filePath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem
    const logger = yield* LoggerService

    const mTime = yield* fs.stat(filePath).pipe(
      Effect.map((stat) => Option.getOrElse(stat.mtime, () => new Date(0))),
      Effect.map((date) => date.getTime()),
      Effect.catchAll((error) => {
        logger.warn(
          `Failed to get file modification time, using fallback value 0`,
          error,
        )
        return Effect.succeed(0)
      }),
    )

    return mTime
  })
