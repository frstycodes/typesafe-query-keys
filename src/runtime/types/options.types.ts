import { If } from '../../types/common'
import { ExtractParamsFromKey, HasParams, ParamValue } from './params.types'

/**
 * Options for configuring query key behavior with optional parameters and search.
 *
 * @template Key - The query key path template string
 * @example
 * ```ts
 * type UserOptions = Options<'/users/$id'>
 * // Result: { params: { id: ParamValue }; search?: unknown }
 * ```
 */
type Options<Key extends string> = Options.ParamsOnly<Key> & {
  search?: unknown
}

namespace Options {
  /**
   * Extracts required parameters from a query key, or an empty object if no parameters exist.
   *
   * @template Key - The query key path template string
   * @example
   * ```ts
   * type WithParams = ParamsOnly<'users/$id'> // { params: { id: ParamValue } }
   * type NoParams = ParamsOnly<'users'> // {}
   * ```
   */
  export type ParamsOnly<Key extends string> = If<
    HasParams<Key>,
    { params: ExtractParamsFromKey<Key> },
    {}
  >

  /**
   * Permissive options type allowing optional parameters and search with any structure.
   * Useful for cases where strict type checking is not required.
   */
  export type Permissive = {
    params?: Record<string, ParamValue>
    search?: unknown
  }
}

export type { Options }
