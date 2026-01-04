import { TObject } from '../../types/common'

/** Valid parameter value types for query key parameters */
export type ParamValue = string | number | boolean

/**
 * Internal helper type for recursively extracting parameters from path templates.
 * Processes paths containing `$param` syntax.
 * @internal
 */
type INTERNAL__ExtractParamsFromKey<T extends string> =
  T extends `${string}$${infer Param}/${infer Rest}`
    ? { [K in Param]: ParamValue } & INTERNAL__ExtractParamsFromKey<Rest>
    : T extends `${string}$${infer Param}`
      ? { [K in Param]: ParamValue }
      : Record<never, never>

/**
 * Extracts parameter types from a path template string.
 *
 * @example
 * ```ts
 * type Params = ExtractParamsFromKey<'/users/$id/posts/$postId'>
 * // Result: { id: ParamValue; postId: ParamValue }
 * ```
 */
export type ExtractParamsFromKey<T extends string> = TObject.Prettify<
  INTERNAL__ExtractParamsFromKey<T>
>

/**
 * Type-level predicate to check if a path contains parameters.
 * Returns `true` if the path has parameters, `false` otherwise.
 */
export type HasParams<TPath extends string> =
  keyof INTERNAL__ExtractParamsFromKey<TPath> extends never ? false : true
