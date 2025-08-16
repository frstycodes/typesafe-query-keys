import ts from "typescript";
import fs from "fs";
import path from "path";
import { glob } from "glob";
import ignore from "ignore";
import { Result, ok, err } from "neverthrow";
import { EMPTY, WITH_ENTRIES } from "./codegen.content";

export type QueryKeyPattern = {
  path: string;
  parentPaths: string[];
};

export async function collectPatterns(
  include: string[],
  ignorePatterns: string[] = [],
): Promise<Result<QueryKeyPattern[], Error>> {
  try {
    const queryKeyPatterns: QueryKeyPattern[] = [];

    const files = await glob(include, {
      ignore: ignorePatterns,
    });

    for (const filePath of files) {
      // Double-check ignore patterns
      if (shouldIgnoreFile(filePath, ignorePatterns)) {
        continue;
      }

      const readResult = Result.fromThrowable(
        () => fs.readFileSync(filePath, "utf-8"),
        (error) => (error instanceof Error ? error : new Error(String(error))),
      )();

      if (readResult.isErr()) {
        console.warn(
          `Failed to read file ${filePath}: ${readResult.error.message}`,
        );
        continue;
      }

      const content = readResult.value;
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true,
      );
      findCreateQKCalls(sourceFile, queryKeyPatterns);
    }

    return ok(queryKeyPatterns);
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

function shouldIgnoreFile(filePath: string, ignorePatterns: string[]): boolean {
  const normalizedPath = filePath.replace(/\\/g, "/");

  if (!fs.statSync(normalizedPath).isFile()) return true;
  if (ignorePatterns.length === 0) return false;

  // Use the ignore library to check if the file should be ignored
  // The ignore library handles gitignore-style patterns, including directory patterns
  const ig = ignore().add(ignorePatterns);
  return ig.ignores(normalizedPath);
}

function findCreateQKCalls(
  sourceFile: ts.SourceFile,
  patterns: QueryKeyPattern[],
) {
  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text == "qk" &&
      node.arguments.length > 0 &&
      ts.isStringLiteral(node.arguments[0]!)
    ) {
      // Only look for direct qk function calls
      const path = node.arguments[0].text;
      const parentPaths = extractParentPaths(path);
      patterns.push({ path, parentPaths });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

function extractParentPaths(path: string): string[] {
  const segments = path.split("/");
  const result: string[] = [];

  let currentPath = "";
  for (const idx in segments) {
    const i = Number(idx);
    if (i > 0) currentPath += "/";

    currentPath += segments[i];
    if (i < segments.length - 1) {
      result.push(currentPath);
    }
  }

  return result;
}

export function generateTypeDefinitions(
  patterns: QueryKeyPattern[],
  outPath: string,
): Result<void, Error> {
  try {
    // Collect all unique paths (including parent paths)
    const allPaths = new Set<string>();

    for (const pattern of patterns) {
      allPaths.add(pattern.path);
      for (const parentPath of pattern.parentPaths) {
        allPaths.add(parentPath);
      }
    }

    // Generate additive interface augmentation as a .ts module
    let content = EMPTY;
    if (allPaths.size) {
      const entries = Array.from(allPaths)
        .map((p) => `    '${p}': true;`)
        .join("\n");
      content = WITH_ENTRIES.replace("{ENTRIES}", entries);
    }

    // Ensure output directory exists
    const outputDir = path.dirname(outPath);
    if (!fs.existsSync(outputDir)) {
      const mkdirResult = Result.fromThrowable(
        () => fs.mkdirSync(outputDir, { recursive: true }),
        (error) => (error instanceof Error ? error : new Error(String(error))),
      )();

      if (mkdirResult.isErr()) {
        return err(
          new Error(
            `Failed to create directory ${outputDir}: ${mkdirResult.error.message}`,
          ),
        );
      }
    }

    const writeResult = Result.fromThrowable(
      () => fs.writeFileSync(outPath, content),
      (error) => (error instanceof Error ? error : new Error(String(error))),
    )();

    if (writeResult.isErr()) {
      return err(
        new Error(
          `Failed to write file ${outPath}: ${writeResult.error.message}`,
        ),
      );
    }

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}
