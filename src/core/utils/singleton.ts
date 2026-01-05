import fs from 'fs'
import os from 'os'
import path from 'path'
import { hashStringSync } from './string'

export function singleton<Return, Args extends any[]>(
  f: (...args: Args) => Return,
) {
  let instance: Return | undefined
  return (...args: Args) => (instance ??= f(...args))
}

/**
 * Creates a process-safe singleton using file-based locking.
 * This ensures only one instance runs even when the function is called multiple times
 * by different processes (e.g., Next.js client/server bundles).
 *
 * The lock is project-specific (based on process.cwd() + cacheBuster) so multiple projects
 * can run simultaneously without interfering with each other.
 *
 * @param name - Unique name for this singleton
 * @param f - Function to execute once
 * @param cacheBuster - Additional string to make the lock unique (e.g., JSON.stringify(config))
 * @returns The result of f(), or undefined if another process has the lock
 */
export function processSafeSingleton<Return>(
  name: string,
  f: () => Return,
  cacheBuster: string = '',
): Return | undefined {
  // Create a project-specific lock name using cwd + cacheBuster
  const lockIdentifier = `${process.cwd()}-${cacheBuster}`
  const projectHash = hashStringSync(lockIdentifier)
  const lockName = `${name}-${projectHash}`

  // Create a lock file in the temp directory
  const lockDir = path.join(os.tmpdir(), 'typesafe-query-keys-locks')
  const lockFile = path.join(lockDir, `${lockName}.lock`)

  try {
    if (!fs.existsSync(lockDir)) {
      fs.mkdirSync(lockDir, { recursive: true })
    }

    // Try to acquire the lock
    if (fs.existsSync(lockFile)) {
      // Lock already exists, check if it's stale
      try {
        const lockData = fs.readFileSync(lockFile, 'utf-8')
        const lockPid = parseInt(lockData, 10)

        // Check if process is still running
        try {
          process.kill(lockPid, 0) // Signal 0 checks if process exists
          // Process is still running, don't start another instance
          return undefined
        } catch {
          // Process is dead, remove stale lock
          fs.unlinkSync(lockFile)
        }
      } catch {
        // Invalid lock file, remove it
        fs.unlinkSync(lockFile)
      }
    }

    // Write our PID to the lock file
    fs.writeFileSync(lockFile, process.pid.toString(), 'utf-8')

    const cleanup = () => {
      if (fs.existsSync(lockFile)) {
        try {
          const lockData = fs.readFileSync(lockFile, 'utf-8')
          if (parseInt(lockData, 10) === process.pid) {
            fs.unlinkSync(lockFile)
          }
        } catch {}
      }
    }

    process.on('exit', cleanup)
    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)

    return f()
  } catch (error) {
    // If we can't acquire lock, return undefined to prevent duplicate instances
    return undefined
  }
}
