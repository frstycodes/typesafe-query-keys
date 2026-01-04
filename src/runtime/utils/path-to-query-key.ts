import { Options } from '../types'

const isDev = process.env.NODE_ENV === 'development'
export function pathToQueryKey(path: string, options: Options.Permissive) {
  if (!path) return []

  const { params = {}, search } = options

  const segments = path.split('/')
  const result: any[] = []
  const addToResult = (value: string) => result.push(value.trim())

  function processSegment(seg: string) {
    if (!seg.startsWith('$')) return void addToResult(seg)

    // strip leading $
    const paramKey = seg.slice(1)

    if (paramKey in params)
      return void addToResult(String(params[paramKey]).trim())
    if (isDev)
      console.warn(
        `[@frsty/typesafe-query-keys] Missing optional parameter: ${paramKey}`,
      )
  }

  segments.forEach(processSegment)

  if (search) result.push(search)

  return result
}
