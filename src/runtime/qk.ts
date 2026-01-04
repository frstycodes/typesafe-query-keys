import { pathToQueryKey } from './utils/path-to-query-key'
import { QueryKeyParser } from './types'

type QKFunction = QueryKeyParser.Fn<'loose'> & {
  /**
   * - Functionally identical to `qk` but enforces the use of registered paths
   * - Only allows using previously registered paths
   */
  use: QueryKeyParser.Fn<'strict'>
}

/**
 * - Creates and registers a query key pattern
 * - Shows existing registered paths as suggestions but allows new paths too
 * @example
 * qk('user/$userId', { params: { userId: 123 } }) // string[]
 * qk('user/$userId', {
 *  params: { userId: 123 },
 *  search: { q: "John" },
 * }) // unknown[]
 * @note
 * Passing search will return the type `unknown[]`
 */
export const qk: QKFunction = (path, ...args) => {
  return pathToQueryKey(path, args[0] ?? {})
}

// Runtime behavior is identical to `qk`, which is why the implementation looks the same
qk.use = function qkUse(path, ...args) {
  return pathToQueryKey(path, args[0] ?? {})
}

/** @internal The name of the query key function */
export const FUNCTION_NAME = qk.name
