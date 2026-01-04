export function areArraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false
  const set = new Set(a)
  for (const value of b) {
    if (!set.has(value)) return false
  }
  return true
}
