import { readFileSync, writeFileSync, statSync } from 'fs'
import { globby } from 'globby'
import { extname } from 'path'
import * as recast from 'recast'
import { TransformOptions, TransformResult } from './types'

/**
 * Codemod to migrate from "/" path separator to "." path separator
 *
 * Uses recast for AST-based transformation to preserve code formatting
 *
 * Transforms:
 * - qk('users/profile') → qk('users.profile')
 * - qk.use('users/$userId/posts') → qk.use('users.$userId.posts')
 * - Template literals: qk(`path/${var}/here`) → qk(`path.${var}.here`)
 */
export async function transformFiles(
  paths: string[],
  options: TransformOptions = {},
): Promise<TransformResult> {
  const result: TransformResult = {
    ok: 0,
    nochange: 0,
    skip: 0,
    error: 0,
    files: [],
  }

  let files: string[] = []

  for (const path of paths) {
    try {
      const stat = statSync(path)

      if (stat.isFile()) {
        files.push(path)
      } else if (stat.isDirectory()) {
        const extensions = options.extensions?.split(',') || [
          'ts',
          'tsx',
          'js',
          'jsx',
        ]
        const pattern = `${path}/**/*.{${extensions.join(',')}}`
        const found = await globby(pattern, {
          absolute: true,
          onlyFiles: true,
        })
        files.push(...found)
      }
    } catch (error) {
      result.error++
      if (options.verbose) {
        console.error(`Error accessing path ${path}:`, error)
      }
    }
  }

  files = [...new Set(files)]

  for (const file of files) {
    try {
      const ext = extname(file)
      if (!['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'].includes(ext)) {
        result.skip++
        continue
      }

      const source = readFileSync(file, 'utf-8')

      // Import parser dynamically for ES modules
      const { default: tsParser } = await import('recast/parsers/typescript.js')

      const ast = recast.parse(source, {
        parser: tsParser,
      })

      let modified = false

      recast.visit(ast, {
        visitCallExpression(path) {
          const node = path.node

          // Check if it's a qk() or qk.use() call
          const isQkCall =
            (node.callee.type === 'Identifier' && node.callee.name === 'qk') ||
            (node.callee.type === 'MemberExpression' &&
              node.callee.object.type === 'Identifier' &&
              node.callee.object.name === 'qk' &&
              node.callee.property.type === 'Identifier' &&
              node.callee.property.name === 'use')

          if (isQkCall && node.arguments.length > 0) {
            const firstArg = node.arguments[0]!

            // Handle string literals
            if (
              firstArg.type === 'StringLiteral' ||
              firstArg.type === 'Literal'
            ) {
              const value = firstArg.value
              if (typeof value === 'string' && value.includes('/')) {
                firstArg.value = value.replace(/\//g, '.')
                modified = true
              }
            }

            // Handle template literals
            if (firstArg.type === 'TemplateLiteral') {
              firstArg.quasis.forEach((quasi: any) => {
                if (quasi.value.raw.includes('/')) {
                  quasi.value.raw = quasi.value.raw.replace(/\//g, '.')
                  quasi.value.cooked = quasi.value.cooked?.replace(/\//g, '.')
                  modified = true
                }
              })
            }
          }

          this.traverse(path)
        },
      })

      if (modified) {
        if (!options.dry) {
          const output = recast.print(ast).code
          writeFileSync(file, output, 'utf-8')
        }
        result.ok++
        result.files.push(file)
      } else {
        result.nochange++
      }
    } catch (error) {
      result.error++
      if (options.verbose) {
        console.error(`Error processing ${file}:`, error)
      }
    }
  }

  return result
}

export default transformFiles
