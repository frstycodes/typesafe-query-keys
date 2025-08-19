import { name } from '../../package.json'

export const EMPTY = `
// This file is auto-generated. Do not edit manually.

import "${name}";

declare module "${name}" {}
`

export const WITH_ENTRIES = `
// This file is auto-generated. Do not edit manually.

import "${name}";

declare module "${name}" {
  export interface RegisteredPaths { \n{ENTRIES}\n }
}
`
