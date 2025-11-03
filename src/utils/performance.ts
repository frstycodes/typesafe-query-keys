export function withPerformance<Return>(fn: () => Return) {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  return [end - start, result] as const
}
