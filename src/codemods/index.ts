import { transformFiles as slashToDot } from './slash-to-dot'
import { CodemodMetadata } from './types.js'

export const codemods: Record<string, CodemodMetadata> = {
  'slash-to-dot': {
    name: 'slash-to-dot',
    description: 'Migrate from "/" to "." path separator',
    version: '2.1.0',
    transform: slashToDot,
  },
}

export { slashToDot }
