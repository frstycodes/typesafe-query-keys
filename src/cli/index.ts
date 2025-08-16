#!/usr/bin/env node

import chokidar from "chokidar";
import { Command } from "commander";
import { collectPatterns, generateTypeDefinitions } from "../codegen";
import { loadConfig } from "../config/config";
import { createLogger } from "../utils/logger";

const program = new Command();

program
  .name("typesafe-query-keys")
  .description("Generate TypeScript types for query keys")
  .version("1.0.0")
  .option("-w, --watch", "Watch for file changes", false)
  .option("--once", "Generate types once and exit", false)
  .parse(process.argv);

const options = program.opts();

async function main() {
  // Load configuration
  const configResult = await loadConfig();

  if (configResult.isErr()) {
    console.error("❌ Error loading configuration:", configResult.error);
    process.exit(1);
    return;
  }

  const config = configResult.value;
  const logger = createLogger(config.verbose, config.verbose);

  if (options.once) {
    // Generate types once
    logger("info", "🔍 Scanning for query key patterns...");
    const patternsResult = await collectPatterns(
      config.include,
      config.exclude,
    );

    if (patternsResult.isErr()) {
      logger("error", "❌ Error collecting patterns:", patternsResult.error);
      process.exit(1);
      return;
    }

    const genResult = generateTypeDefinitions(
      patternsResult.value,
      config.outputFile,
    );

    if (genResult.isErr()) {
      logger("error", "❌ Error generating type definitions:", genResult.error);
      process.exit(1);
      return;
    }

    logger("info", "✅ Types generated successfully");
    return;
  }

  if (options.watch) {
    // Watch mode
    logger("info", "\n👀 Starting file watcher...");

    // Initial generation
    logger("info", "🔍 Initial scan for query key patterns...");
    const initialPatternsResult = await collectPatterns(
      config.include,
      config.exclude,
    );

    if (initialPatternsResult.isErr()) {
      logger(
        "error",
        "❌ Error collecting initial patterns:",
        initialPatternsResult.error,
      );
      process.exit(1);
      return;
    }

    const initialGenResult = generateTypeDefinitions(
      initialPatternsResult.value,
      config.outputFile,
    );

    if (initialGenResult.isErr()) {
      logger(
        "error",
        "❌ Error generating initial type definitions:",
        initialGenResult.error,
      );
      process.exit(1);
      return;
    }

    logger("info", "✅ Initial types generated successfully");

    // Set up file watcher
    const watcher = chokidar.watch(config.include, {
      ignored: config.exclude,
      persistent: true,
      ignoreInitial: true,
      alwaysStat: true,
    });

    let isProcessing = false;
    let pendingRegeneration = false;

    async function regenerateTypes(changedFile?: string) {
      if (isProcessing) {
        pendingRegeneration = true;
        return;
      }

      isProcessing = true;

      if (changedFile) {
        logger("info", `🔄 Regenerating types for ${changedFile}`);
      } else {
        logger("info", "🔄 Regenerating types...");
      }

      const patternsResult = await collectPatterns(
        config.include,
        config.exclude,
      );

      if (patternsResult.isErr()) {
        logger("error", "❌ Failed to collect patterns:", patternsResult.error);
      } else {
        const genResult = generateTypeDefinitions(
          patternsResult.value,
          config.outputFile,
        );

        if (genResult.isErr()) {
          logger(
            "error",
            "❌ Failed to generate type definitions:",
            genResult.error,
          );
        } else {
          logger("info", "✅ Types regenerated successfully");
        }
      }

      isProcessing = false;

      // Handle pending regeneration
      if (pendingRegeneration) {
        pendingRegeneration = false;
        setTimeout(() => regenerateTypes(), 100);
      }
    }

    // Watch events
    watcher
      .on("add", (filePath) => {
        logger("info", `📄 File added: ${filePath}`);
        regenerateTypes(filePath);
      })
      .on("change", (filePath) => {
        logger("info", `📝 File changed: ${filePath}`);
        regenerateTypes(filePath);
      })
      .on("unlink", (filePath) => {
        logger("info", `🗑️  File removed: ${filePath}`);
        regenerateTypes(filePath);
      })
      .on("error", (error) => {
        logger("error", "❌ Watcher error:", error);
      });

    logger("info", "🚀 Watching for file changes...\n");

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      logger("info", "\n🛑 Stopping watcher...");
      watcher.close();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      logger("info", "\n🛑 Stopping watcher...");
      watcher.close();
      process.exit(0);
    });
  } else {
    // Default: generate once
    logger("info", "🔍 Scanning for query key patterns...");
    const patternsResult = await collectPatterns(
      config.include,
      config.exclude,
    );

    if (patternsResult.isErr()) {
      logger("error", "❌ Error collecting patterns:", patternsResult.error);
      process.exit(1);
      return;
    }

    const genResult = generateTypeDefinitions(
      patternsResult.value,
      config.outputFile,
    );

    if (genResult.isErr()) {
      logger("error", "❌ Error generating type definitions:", genResult.error);
      process.exit(1);
      return;
    }

    logger("info", "✅ Types generated successfully");
  }
}

main();
