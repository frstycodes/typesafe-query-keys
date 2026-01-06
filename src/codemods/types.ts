export interface TransformOptions {
  extensions?: string
  dry?: boolean
  verbose?: boolean
}

export interface TransformResult {
  ok: number
  nochange: number
  skip: number
  error: number
  files: string[]
}

export interface CodemodMetadata {
  name: string
  description: string
  version: string
  transform: (
    paths: string[],
    options: TransformOptions,
  ) => Promise<TransformResult>
}
