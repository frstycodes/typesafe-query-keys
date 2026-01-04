import { Data } from 'effect/index'

export class GlobbyError extends Data.TaggedError('GlobbyError')<{
  message: string
  cause?: unknown
}> {}

export class WatcherError extends Data.TaggedError('WatcherError')<{
  message: string
  cause?: unknown
}> {}
