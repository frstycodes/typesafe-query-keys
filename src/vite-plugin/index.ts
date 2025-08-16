import fs from "fs";
import path from "path";
import ignore from "ignore";
import type { Plugin, PluginOption } from "vite";
import Package from "../../package.json";
import { collectPatterns, generateTypeDefinitions } from "../codegen";
import { ConfigInsert, parseConfig } from "../config/config";
import { createLogger } from "../utils/logger";

const PLUGIN_NAME = Package.name + "-vite-plugin";

export function typesafeQueryKeysPlugin(options: ConfigInsert): PluginOption {
  const logger = createLogger(!!options.verbose, !!options.verbose);

  const plugin = {
    name: PLUGIN_NAME,

    async buildStart() {
      // Validate the config
      const configResult = parseConfig(options);

      if (configResult.isErr()) throw configResult.error;

      const config = configResult.value;

      logger("info", "🔍 Scanning for query keys...");
      const patternsResult = await collectPatterns(
        config.include,
        config.exclude,
      );

      if (patternsResult.isErr()) throw patternsResult.error;

      const genResult = generateTypeDefinitions(
        patternsResult.value,
        config.outputFile,
      );

      if (genResult.isErr()) throw genResult.error;

      logger("info", "✅ Types generated successfully");
    },

    configureServer(server) {
      const watcher = server.watcher;

      // Validate the config
      const configResult = parseConfig(options);

      if (configResult.isErr()) {
        return void server.config.logger.error(
          `❌ Configuration error: ${configResult.error.message}`,
        );
      }

      const config = configResult.value;

      let isProcessing = false;
      let pendingRegeneration = false;

      async function onChange(changedPath: string) {
        // Check if the changed file should be ignored
        if (!fs.statSync(changedPath).isFile()) return;
        if (matchesAnyGlob(changedPath, config.exclude!)) return;

        // Check if the changed file matches any include pattern
        if (!matchesAnyGlob(changedPath, config.include!)) return;

        // Debounce rapid changes
        if (isProcessing) {
          pendingRegeneration = true;
          return;
        }

        isProcessing = true;

        logger("info", "🔄 Regenerating types for", changedPath);
        const patternsResult = await collectPatterns(
          config.include,
          config.exclude,
        );

        if (patternsResult.isErr()) {
          server.config.logger.error(
            `❌ Failed to collect patterns for ${changedPath}: ${patternsResult.error.message}`,
          );
        } else {
          const genResult = generateTypeDefinitions(
            patternsResult.value,
            config.outputFile,
          );

          if (genResult.isErr()) {
            server.config.logger.error(
              `❌ Failed to generate definitions for ${changedPath}: ${genResult.error.message}`,
            );
          } else {
            logger("info", "✅ Types regenerated successfully");

            // Trigger a full reload to pick up the new types
            server.ws.send({ type: "full-reload" });
          }
        }

        isProcessing = false;

        // Handle pending regeneration
        if (pendingRegeneration) {
          pendingRegeneration = false;
          setTimeout(() => onChange(changedPath), 100);
        }
      }

      // Watch for file changes
      watcher.on("add", onChange);
      watcher.on("change", onChange);
      watcher.on("unlink", onChange);

      // Also watch the output file to prevent infinite loops
      watcher.add(config.outputFile);

      logger("info", "\n🚀 Watching for file changes...");
    },
  } satisfies Plugin;

  return plugin;
}

function matchesAnyGlob(filePath: string, globs: string[]): boolean {
  const relative = path.relative(process.cwd(), filePath);
  const normalized = relative.replace(/\\/g, "/");

  // Use the ignore library to check if the file should be ignored
  // The ignore library handles gitignore-style patterns, including directory patterns with trailing slashes
  const ig = ignore().add(globs);
  return ig.ignores(normalized);
}
