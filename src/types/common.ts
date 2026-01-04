/**
 *
 * TObject namespace containing utility types for working with object types.
 * Provides helper types for type manipulation and inspection.
 */
export namespace TObject {
  /**
   * Gets the type of a property from an object type.
   * @template Object - The object type
   * @template Key - The property key to retrieve
   * @returns The type of property `Key` in `Object`, or never if `Key` is not a key of `Object`
   */
  export type Get<
    Object extends object,
    Key extends string,
    Default = never,
  > = Key extends keyof Object ? Object[Key] : Default

  /**
   * Prettifies an object type by expanding all properties for better readability in IDE tooltips.
   * @template T - The object type to prettify
   * @returns A new object type with all properties expanded
   */
  export type Prettify<T> = {
    [K in keyof T]: T[K]
  } & {}
}

export namespace TString {
  export type Autocomplete<T> = T | (string & {})
}

export type If<Condition extends boolean, True, False> = Condition extends true
  ? True
  : False
