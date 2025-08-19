import fs from 'fs'
import { glob } from 'glob'
import { Result, err, ok } from 'neverthrow'
import path from 'path'
import ts from 'typescript'
import { hashFile } from '../utils/crypto'
import { EMPTY, WITH_ENTRIES } from './codegen.content'
import { performance } from 'perf_hooks'

export type QueryKeyPattern = {
  path: string
  parentPaths: string[]
}

export async function collectPatterns(
  include: string[],
  ignorePatterns: string[] = [],
): Promise<Result<QueryKeyPattern[], Error>> {
  try {
    const queryKeyPatterns: QueryKeyPattern[] = []

    const files = await glob(include, {
      ignore: ignorePatterns,
      nodir: true,
    })

    for (const filePath of files) {
      const readResult = Result.fromThrowable(
        () => fs.readFileSync(filePath, 'utf-8'),
        (error) => (error instanceof Error ? error : new Error(String(error))),
      )()

      if (readResult.isErr()) {
        console.warn(
          `Failed to read file ${filePath}: ${readResult.error.message}`,
        )
        continue
      }

      const content = readResult.value
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true,
      )
      findCreateQKCalls(sourceFile, queryKeyPatterns)
    }

    return ok(queryKeyPatterns)
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)))
  }
}

function findCreateQKCalls(
  sourceFile: ts.SourceFile,
  patterns: QueryKeyPattern[],
) {
  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text == 'qk' &&
      node.arguments.length > 0 &&
      ts.isStringLiteral(node.arguments[0]!)
    ) {
      // Only look for direct qk function calls
      const path = node.arguments[0].text
      const parentPaths = extractParentPaths(path)
      patterns.push({ path, parentPaths })
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
}

function extractParentPaths(path: string): string[] {
  const segments = path.split('/')
  const result: string[] = []

  let currentPath = ''
  for (const idx in segments) {
    const i = Number(idx)
    if (i > 0) currentPath += '/'

    currentPath += segments[i]
    if (i < segments.length - 1) {
      result.push(currentPath)
    }
  }

  return result
}

export function generateTypeDefinitions(
  patterns: QueryKeyPattern[],
  outPath: string,
): Result<string | null, Error> {
  try {
    const start = performance.now()
    // Collect all unique paths (including parent paths)
    const allPaths = new Set<string>()

    for (const pattern of patterns) {
      allPaths.add(pattern.path)
      for (const parentPath of pattern.parentPaths) {
        allPaths.add(parentPath)
      }
    }

    // Generate additive interface augmentation as a .ts module
    let content = EMPTY
    if (allPaths.size) {
      const entries = Array.from(allPaths)
        .map((p) => `\t\t'${p}': true;`)
        .join('\n')
      content = WITH_ENTRIES.replace('{ENTRIES}', entries)
    }

    // Ensure output directory exists
    const outputDir = path.dirname(outPath)
    if (!fs.existsSync(outputDir)) {
      const mkdirResult = Result.fromThrowable(
        () => fs.mkdirSync(outputDir, { recursive: true }),
        (error) => (error instanceof Error ? error : new Error(String(error))),
      )()

      if (mkdirResult.isErr()) {
        return err(
          new Error(
            `Failed to create directory ${outputDir}: ${mkdirResult.error.message}`,
          ),
        )
      }
    }

    const writeResult = Result.fromThrowable(
      () => fs.writeFileSync(outPath, content),
      (error) => (error instanceof Error ? error : new Error(String(error))),
    )()

    if (writeResult.isErr()) {
      return err(
        new Error(
          `Failed to write file ${outPath}: ${writeResult.error.message}`,
        ),
      )
    }

    const end = performance.now()

    console.log(
      `Generated query key definitions in ${(end - start).toFixed(0)}ms`,
    )

    // Calculate and return the hash of the generated file
    return ok(hashFile(content))
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)))
  }
}
