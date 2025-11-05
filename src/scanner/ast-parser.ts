import ts from 'typescript'

type ExtractQueryKeysProps = {
  fileName: string
  sourceText: string
  queryKeys: Set<string>
  functionNames: string[]
}

export function extractQueryKeys({
  fileName,
  sourceText,
  queryKeys,
  functionNames,
}: ExtractQueryKeysProps) {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
  )

  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      functionNames.includes(node.expression.text) &&
      node.arguments.length &&
      ts.isStringLiteral(node.arguments[0]!)
    ) {
      const key = node.arguments[0].text
      queryKeys.add(key)
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
}
