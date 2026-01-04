export function dedupeBy<T>(
  array: ArrayLike<T>,
  key: (item: T) => unknown,
): T[] {
  const seen = new Set<unknown>()
  const res: T[] = []

  for (let i = 0; i < array.length; i++) {
    const item = array[i]!
    const keyVal = key(item)
    if (seen.has(keyVal)) continue
    seen.add(keyVal)
    res.push(item)
  }

  return res
}
