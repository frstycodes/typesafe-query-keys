type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type BaseOptions = { search?: Record<string, unknown> }

export type ParamValue = string | number | boolean

// Type helpers for extracting parameters from paths
type INTERNAL__ExtractParamsFromKey<T extends string> =
  T extends `${string}$${infer Param}/${infer Rest}`
    ? { [K in Param]: ParamValue } & INTERNAL__ExtractParamsFromKey<Rest>
    : T extends `${string}$${infer Param}`
      ? { [K in Param]: ParamValue }
      : Record<never, never>

export type ExtractParamsFromKey<T extends string> = Prettify<
  INTERNAL__ExtractParamsFromKey<T>
>

export type HasParams<TPath extends string> =
  keyof INTERNAL__ExtractParamsFromKey<TPath> extends never ? false : true

export interface Register {}
export type RegisterValue<Key> = Key extends keyof Register
  ? Register[Key]
  : never

export type QueryKeys = RegisterValue<'queryKeys'>[number]
