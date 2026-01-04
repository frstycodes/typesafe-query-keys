export function areArraysEqual<T>(a: T[], b: T[]): boolean {
  const setA = new Set(a)
  const setB = new Set(b)

  for (const value of setA) {
    if (!setB.has(value)) return false
  }

  for (const value of setB) {
    if (!setA.has(value)) return false
  }
  return true
}
