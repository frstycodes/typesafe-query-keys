import crypto from 'node:crypto'
import { LoggerService } from '../services'
import * as Effect from 'effect/Effect'

export function hashString(str: string) {
  return Effect.gen(function* () {
    const logger = yield* LoggerService
    const hash = yield* Effect.try(() => hashStringSync(str)).pipe(
      Effect.catchAll((error) => {
        logger.warn('Failed to hash string. Using fallback ""\n', error)
        return Effect.succeed('')
      }),
    )

    return hash
  })
}

export function hashStringSync(str: string) {
  return crypto.createHash('sha256').update(str).digest('hex')
}
