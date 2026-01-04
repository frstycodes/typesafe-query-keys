import { Effect } from 'effect'
import ts from 'typescript'
import { Logs, FUNCTION_NAME } from '@/core/config'
import { LoggerService } from '@/core/services'

function extractParentKeys(path: string) {
  const segments = path.split('/')
  const result = []
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

export function enrichKeysWithParents(allKeys: readonly string[]): Set<string> {
  const keysWithParents = new Set(allKeys)
  for (const key of allKeys) {
    for (const parent of extractParentKeys(key)) {
      keysWithParents.add(parent)
    }
  }
  return keysWithParents
}

export type ExtractQueryKeysProps = {
  filePath: string
  content: string
}
export const extractQueryKeys = ({
  filePath,
  content: sourceText,
}: ExtractQueryKeysProps) =>
  Effect.gen(function* () {
    const logger = yield* LoggerService
    logger.debug(`Scanning ${filePath}`)

    const queryKeys = new Set<string>()

    const sourceFile = yield* Effect.try(() =>
      ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest),
    ).pipe(
      Effect.catchAll((unknownError) => {
        logger.error(
          `Failed to parse TypeScript file at ${filePath}. Types may be stale`,
          unknownError,
        )
        return Effect.succeed(null)
      }),
    )

    if (!sourceFile) return []

    function visit(node: ts.Node) {
      const cont = (): void => ts.forEachChild(node, visit)

      if (!ts.isCallExpression(node)) return cont()
      if (!ts.isIdentifier(node.expression)) return cont()
      if (node.expression?.text != FUNCTION_NAME) return cont()

      const firstArg = node.arguments[0]

      if (firstArg && isString(firstArg)) {
        queryKeys.add(firstArg?.text)
        return cont()
      }

      const pos = sourceFile!.getLineAndCharacterOfPosition(node.getStart())

      logger.error(
        Logs.invalidQkCall(
          filePath,
          [pos.line, pos.character],
          firstArg ? ts.SyntaxKind[firstArg.kind] : 'no arguments',
        ),
      )

      cont()
    }

    visit(sourceFile)

    return [...queryKeys]
  })

function isString(node: ts.Node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
}
