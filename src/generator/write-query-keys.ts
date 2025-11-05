import { hashString } from '@/utils'
import { queryKeysTemplate } from './template'
import fs from 'fs'
import path from 'path'
import { err, ok } from 'neverthrow'

export type WriteQueryKeysToFileProps = {
  queryKeys: string[]
  lastGenerationHash: string | null
  outputPath: string
}

export function writeQueryKeysToFile({
  queryKeys,
  lastGenerationHash,
  outputPath,
}: WriteQueryKeysToFileProps) {
  const queryKeysType = queryKeysTemplate(queryKeys)
  const contentHash = hashString(queryKeysType)
  if (contentHash == lastGenerationHash) return lastGenerationHash

  // Create directory if it doesn't exist
  const ensureRes = ensurePath(outputPath)
  if (ensureRes.isErr()) {
    console.error(ensureRes.error.message)
    return null
  }

  fs.writeFileSync(outputPath, queryKeysType)
  return contentHash
}

function ensurePath(path_: string) {
  try {
    const dir = path.dirname(path_)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    return ok()
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)))
  }
}
