import { pathToQueryKey } from './path-to-query-key'
import type {
  BaseOptions,
  ExtractParamsFromKey,
  HasParams,
  QueryKeys,
} from './types.runtime'

/**
 * - Creates and registers a query key pattern
 * - Shows existing registered paths as suggestions but allows new paths too
 */
export function qk<
  TPath extends (string & {}) | QueryKeys,
  TOpts extends BaseOptions,
>(
  // The path can be any string, but we'll suggest existing paths
  path: TPath,
  // If the path template has params, options is required; otherwise optional
  ...args: HasParams<TPath> extends true
    ? [options: { params: ExtractParamsFromKey<TPath> } & TOpts]
    : [options?: TOpts]
) {
  return pathToQueryKey(path, args[0])
}
qk.use = useQK

/**
 * - Functionally equivalent to `qk` but enforces the use of registered paths
 * - References a registered query key pattern
 * - Only allows using previously registered paths
 */
export function useQK<TPath extends QueryKeys, TOpts extends BaseOptions>(
  path: TPath,
  // If the path template has params, options is required; otherwise optional
  ...args: HasParams<TPath> extends true
    ? [options: { params: ExtractParamsFromKey<TPath> } & TOpts]
    : [options?: TOpts]
) {
  return pathToQueryKey(path, args[0])
}
