import crypto from 'crypto'

export function hashString(content: string) {
  try {
    return crypto.createHash('md5').update(content).digest('hex')
  } catch {
    return null
  }
}
