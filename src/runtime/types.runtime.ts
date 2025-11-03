export type BaseOptions = { search?: Record<string, unknown> }

export type ParamValue = string | number | boolean

// Type helpers for extracting parameters from paths
export type ExtractParamsFromKey<T extends string> =
  T extends `${string}$${infer Param}/${infer Rest}`
    ? { [K in Param]: ParamValue } & ExtractParamsFromKey<Rest>
    : T extends `${string}$${infer Param}`
      ? { [K in Param]: ParamValue }
      : Record<never, never>

export type HasParams<TPath extends string> =
  keyof ExtractParamsFromKey<TPath> extends never ? false : true

export type OptionsFor<TPath extends string> =
  HasParams<TPath> extends true
    ? { params: ExtractParamsFromKey<TPath> } & BaseOptions
    : BaseOptions

export interface Register {}

// @ts-expect-error
export type QueryKeys = Register['queryKeys'][number]
