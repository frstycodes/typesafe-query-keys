import { name } from '../../package.json'

export const EMPTY = `import type {} from "${name}";

// This file is auto-generated. Do not edit manually.
declare module "${name}" {}
`

export const WITH_ENTRIES = `import type {} from "${name}";

// This file is auto-generated. Do not edit manually.
declare module "${name}" {
  export interface RegisteredPaths { \n{ENTRIES}\n }
}
`
