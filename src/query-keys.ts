type QueryKey = readonly unknown[];

// Additive registration interface (declaration-merge target)
// The generated file augments this interface by adding keys for each path.
// Keep it empty to allow safe declaration merging.
export interface RegisteredPaths {
  // Placeholder to satisfy linting; excluded from public union type
  __placeholder__?: never;
}

// Union of all registered path keys (excluding the placeholder)
export type QueryKeyPaths = Exclude<
  Extract<keyof RegisteredPaths, string>,
  "__placeholder__"
>;

// Type helpers for extracting parameters from paths
export type ExtractParamsFromID<T extends string> =
  T extends `${string}$${infer Param}/${infer Rest}`
    ? { [K in Param]: string | number } & ExtractParamsFromID<Rest>
    : T extends `${string}$${infer Param}`
      ? { [K in Param]: string | number | boolean }
      : Record<never, never>;

export type HasParams<TPath extends string> =
  keyof ExtractParamsFromID<TPath> extends never ? false : true;

type CommonOptions = { search?: Record<string, unknown> };
type OptionsFor<TPath extends string> =
  HasParams<TPath> extends true
    ? { params: ExtractParamsFromID<TPath> } & CommonOptions
    : CommonOptions;

/**
 * Converts a path pattern and params into a TanStack Query query key array
 */
function pathToQueryKey(
  path: string,
  options: {
    params?: Record<string, unknown>;
    search?: Record<string, unknown>;
  } = {},
): QueryKey {
  const { params = {}, search = {} } = options;

  const segments = path.split("/");
  const result = [];

  function processSegment(seg: string) {
    if (!seg.startsWith("$")) return void result.push(seg);

    // strip leading $
    const paramKey = seg.slice(1);

    if (paramKey in params && params[paramKey])
      return void result.push(params[paramKey]);

    console.warn(`Missing optional parameter: ${paramKey}`);
  }

  segments.forEach(processSegment);

  if (Object.keys(search).length > 0) result.push(search);

  return result as QueryKey;
}

/**
 * - Creates and registers a query key pattern
 * - Shows existing registered paths as suggestions but allows new paths too
 */
export function qk<TPath extends string>(
  // The path can be any string, but we'll suggest existing paths
  path: TPath | QueryKeyPaths,
  // If the path template has params, options is required; otherwise optional
  ...args: HasParams<TPath> extends true
    ? [options: { params: ExtractParamsFromID<TPath> } & CommonOptions]
    : [options?: CommonOptions]
): QueryKey {
  const options = (args[0] ?? undefined) as OptionsFor<TPath> | undefined;
  return pathToQueryKey(path as string, options);
}
qk.use = useQK;

/**
 * - Functionally equivalent to `qk` but enforces the use of registered paths
 * - References a registered query key pattern
 * - Only allows using previously registered paths
 */
function useQK<
  // The path must be a registered path
  TPath extends QueryKeyPaths,
>(
  path: TPath,
  // If the path template has params, options is required; otherwise optional
  ...args: HasParams<TPath> extends true
    ? [options: { params: ExtractParamsFromID<TPath> } & CommonOptions]
    : [options?: CommonOptions]
): QueryKey {
  const options = (args[0] as OptionsFor<TPath>) ?? undefined;
  return pathToQueryKey(path as string, options);
}
