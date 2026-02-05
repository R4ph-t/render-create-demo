/**
 * Check command - Verify if local rules are up to date
 */

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import type { CheckOptions } from "../types.js";
import { compareFiles, getTargetDir, TEMPLATES_DIR } from "../utils.js";

/**
 * Main check command handler
 */
export async function check(options: CheckOptions): Promise<void> {
  const targetDir = getTargetDir();
  const rulesDir = join(targetDir, ".cursor", "rules");

  let inSync = 0;
  let outOfSync = 0;
  const _missing = 0;
  let custom = 0;

  console.log(chalk.blue("Checking cursor-rules status...\n"));

  // Check rule files
  if (existsSync(rulesDir)) {
    const files = readdirSync(rulesDir);
    for (const file of files) {
      if (!file.endsWith(".mdc")) {
        continue;
      }

      const ruleName = file.replace(".mdc", "");
      const templatePath = `cursor/rules/${ruleName}.mdc`;
      const targetPath = join(rulesDir, file);

      // Check if template exists
      if (!existsSync(join(TEMPLATES_DIR, templatePath))) {
        console.log(chalk.gray(`  ${file} - custom rule`));
        custom++;
        continue;
      }

      const result = compareFiles(templatePath, targetPath);

      if (result.status === "in-sync") {
        console.log(chalk.green(`  ${file} - up to date`));
        inSync++;
      } else if (result.status === "out-of-sync") {
        console.log(chalk.yellow(`  ${file} - out of sync`));
        outOfSync++;
      }
    }
  } else {
    console.log(chalk.yellow("  No .cursor/rules directory found"));
  }

  // Check config files
  const configMappings: { name: string; template: string; target: string }[] = [
    { name: "biome.json", template: "biome.json", target: "biome.json" },
    { name: "ruff.toml", template: "ruff.toml", target: "ruff.toml" },
    { name: "tsconfig.base.json", template: "tsconfig.base.json", target: "tsconfig.base.json" },
  ];

  for (const config of configMappings) {
    const targetPath = join(targetDir, config.target);

    if (!existsSync(targetPath)) {
      continue; // Skip if not present (might not be needed for this project)
    }

    const result = compareFiles(config.template, targetPath);

    if (result.status === "in-sync") {
      console.log(chalk.green(`  ${config.name} - up to date`));
      inSync++;
    } else if (result.status === "out-of-sync") {
      console.log(chalk.yellow(`  ${config.name} - out of sync`));
      outOfSync++;
    } else if (result.status === "template-missing") {
      console.log(chalk.gray(`  ${config.name} - custom config`));
      custom++;
    }
  }

  // Summary
  console.log();
  console.log(chalk.blue("Summary:"));
  console.log(`  ${chalk.green(`${inSync} up to date`)}`);
  if (outOfSync > 0) {
    console.log(`  ${chalk.yellow(`${outOfSync} out of sync`)}`);
  }
  if (custom > 0) {
    console.log(`  ${chalk.gray(`${custom} custom (not tracked)`)}`);
  }

  // Exit with error code if CI mode and out of sync
  if (options.ci && outOfSync > 0) {
    console.log(chalk.red("\nCI check failed: Files are out of sync."));
    console.log(chalk.gray("Run 'npx @render-examples/cursor-rules sync' to update."));
    process.exit(1);
  }

  if (outOfSync > 0) {
    console.log(chalk.yellow("\nRun 'npx @render-examples/cursor-rules sync' to update."));
  } else {
    console.log(chalk.green("\nAll tracked files are up to date!"));
  }
}
