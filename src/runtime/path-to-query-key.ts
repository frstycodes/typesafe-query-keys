import { BaseOptions, ParamValue } from './types.runtime'

type Options = BaseOptions & {
  params?: Record<string, ParamValue>
}

export function pathToQueryKey<TOpts extends Options>(
  path: string,
  options = {} as TOpts,
) {
  if (!path) return []
  type TResult = TOpts extends { search: any } ? unknown[] : string[]

  const { params = {}, search = {} } = options

  const segments = path.split('/')
  const result: any[] = []

  function processSegment(seg: string) {
    if (!seg.startsWith('$')) return void result.push(seg)

    // strip leading $
    const paramKey = seg.slice(1)

    if (paramKey in params) return void result.push(String(params[paramKey]))
    console.warn(`Missing optional parameter: ${paramKey}`)
  }

  segments.forEach(processSegment)

  if (Object.keys(search).length > 0) result.push(search)

  return result as TResult
}
