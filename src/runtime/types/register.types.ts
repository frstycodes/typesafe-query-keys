import { TObject } from '@/types/common'

/**
 * Module augmentation interface for registering application-specific types.
 *
 * @example
 * ```ts
 * declare module 'typesafe-query-keys' {
 *   interface Register {
 *     queryKeys: ["user", "user/$userId", "product"]
 *   }
 * }
 * ```
 */
export interface Register {}

/**
 * Union type of all registered query keys.
 * Extracts the array element type from the registered `queryKeys`.
 */
export type RegisteredKeys = TObject.Get<Register, 'queryKeys'>[number]
