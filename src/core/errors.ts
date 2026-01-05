import * as Data from 'effect/Data'

export class GlobbyError extends Data.TaggedError('GlobbyError')<{
  message: string
  cause?: unknown
}> {}

export class WatcherError extends Data.TaggedError('WatcherError')<{
  message: string
  cause?: unknown
}> {}
