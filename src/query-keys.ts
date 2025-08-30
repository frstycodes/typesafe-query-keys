// Additive registration interface (declaration-merge target)
// The generated file augments this interface by adding keys for each path.
// Keep it empty to allow safe declaration merging.
// export interface RegisteredPaths {
//   // Placeholder to satisfy linting; excluded from public union type
//   __placeholder__?: never
// }
//
export interface Register {}

// Union of all registered path keys (excluding the placeholder)
// export type QueryKeyPaths = Exclude<
//   Extract<keyof RegisteredPaths, string>,
//   '__placeholder__'
// >
// @ts-expect-error
export type QueryKeyPaths = Register['patterns'][keyof Register['patterns']]

type ParamValue = string | number | boolean
// Type helpers for extracting parameters from paths
export type ExtractParamsFromID<T extends string> =
  T extends `${string}$${infer Param}/${infer Rest}`
    ? { [K in Param]: ParamValue } & ExtractParamsFromID<Rest>
    : T extends `${string}$${infer Param}`
      ? { [K in Param]: ParamValue }
      : Record<never, never>

export type HasParams<TPath extends string> =
  keyof ExtractParamsFromID<TPath> extends never ? false : true

type CommonOptions = { search?: Record<string, unknown> }
type OptionsFor<TPath extends string> =
  HasParams<TPath> extends true
    ? { params: ExtractParamsFromID<TPath> } & CommonOptions
    : CommonOptions

/**
 * Converts a path pattern and params into a TanStack Query query key array
 */

type Options = {
  params?: Record<string, unknown>
  search?: Record<string, unknown>
}

// Modify return type based on presence of search
function pathToQueryKey<
  TOpts extends Options,
  TResult = TOpts extends { search: Record<string, unknown> }
    ? unknown[]
    : string[],
>(path: string, options: TOpts = {} as TOpts): TResult {
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

/**
 * - Creates and registers a query key pattern
 * - Shows existing registered paths as suggestions but allows new paths too
 * @queryKey
 */
export function qk<TPath extends string, TOpts extends object>(
  // The path can be any string, but we'll suggest existing paths
  path: TPath | QueryKeyPaths,
  // If the path template has params, options is required; otherwise optional
  ...args: HasParams<TPath> extends true
    ? [options: { params: ExtractParamsFromID<TPath> } & CommonOptions & TOpts]
    : [options?: CommonOptions & TOpts]
) {
  const options = (args[0] ?? undefined) as
    | (OptionsFor<TPath> & TOpts)
    | undefined
  return pathToQueryKey(path as string, options)
}
qk.use = useQK

/**
 * - Functionally equivalent to `qk` but enforces the use of registered paths
 * - References a registered query key pattern
 * - Only allows using previously registered paths
 */
function useQK<
  // The path must be a registered path
  TPath extends QueryKeyPaths,
  TOpts extends object,
>(
  path: TPath,
  // If the path template has params, options is required; otherwise optional
  ...args: HasParams<TPath> extends true
    ? [options: { params: ExtractParamsFromID<TPath> } & CommonOptions & TOpts]
    : [options?: CommonOptions & TOpts]
) {
  const options = (args[0] as OptionsFor<TPath> & TOpts) ?? undefined
  return pathToQueryKey(path as string, options)
}
