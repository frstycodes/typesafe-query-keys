export function extractParentKeys(path: string) {
  const segments = path.split('/')
  const result = []
  let currentPath = ''

  for (const idx in segments) {
    const i = Number(idx)
    if (i > 0) currentPath += '/'
    currentPath += segments[i]
    if (i < segments.length - 1) {
      result.push(currentPath)
    }
  }

  return result
}
