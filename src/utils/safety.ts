import { Result, ResultAsync } from 'neverthrow'

export function safeCall<Return, ErrReturn>(
  fn: () => Return,
  errFn: (err: unknown) => ErrReturn = (err) => err as ErrReturn,
) {
  return Result.fromThrowable(fn, errFn)()
}

export function safeCallAsync<Return, ErrReturn>(
  promise: Promise<Return>,
  errFn: (err: unknown) => ErrReturn = (err) => err as ErrReturn,
) {
  return ResultAsync.fromPromise(promise, errFn)
}
