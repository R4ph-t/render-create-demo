/**
 * Sync command - Update local rules with the latest package templates
 */

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import inquirer from "inquirer";
import type { SyncOptions } from "../types.js";
import { compareFiles, copyTemplate, displayDiff, getTargetDir, TEMPLATES_DIR } from "../utils.js";

interface SyncConfirmAnswer {
  confirm: boolean;
}

/**
 * Get list of synced files in the target project
 */
function getSyncedFiles(targetDir: string): { rules: string[]; configs: string[] } {
  const rules: string[] = [];
  const configs: string[] = [];

  // Check for cursor rules
  const rulesDir = join(targetDir, ".cursor", "rules");
  if (existsSync(rulesDir)) {
    const files = readdirSync(rulesDir);
    for (const file of files) {
      if (file.endsWith(".mdc")) {
        rules.push(file.replace(".mdc", ""));
      }
    }
  }

  // Check for config files
  if (existsSync(join(targetDir, "biome.json"))) {
    configs.push("biome");
  }
  if (existsSync(join(targetDir, "ruff.toml"))) {
    configs.push("ruff");
  }
  if (existsSync(join(targetDir, "tsconfig.base.json"))) {
    configs.push("tsconfig");
  }

  return { rules, configs };
}

/**
 * Main sync command handler
 */
export async function sync(options: SyncOptions): Promise<void> {
  const targetDir = getTargetDir();
  const { rules, configs } = getSyncedFiles(targetDir);

  if (rules.length === 0 && configs.length === 0) {
    console.log(chalk.yellow("No cursor-rules files found in this project."));
    console.log(chalk.gray("Run 'npx @render-examples/cursor-rules init' to set up."));
    return;
  }

  console.log(chalk.blue("Checking for updates...\n"));

  const outOfSync: { templatePath: string; targetPath: string; diff: import("diff").Change[] }[] =
    [];

  // Check rule files
  for (const rule of rules) {
    const templatePath = `cursor/rules/${rule}.mdc`;
    const targetPath = join(targetDir, ".cursor", "rules", `${rule}.mdc`);

    // Check if template exists
    if (!existsSync(join(TEMPLATES_DIR, templatePath))) {
      console.log(chalk.yellow(`  ${rule}.mdc - custom rule (no template)`));
      continue;
    }

    const result = compareFiles(templatePath, targetPath);

    if (result.status === "in-sync") {
      console.log(chalk.green(`  ${rule}.mdc - up to date`));
    } else if (result.status === "out-of-sync" && result.diff) {
      console.log(chalk.yellow(`  ${rule}.mdc - out of sync`));
      outOfSync.push({ templatePath, targetPath, diff: result.diff });
    }
  }

  // Check config files
  const configMappings: Record<string, { template: string; target: string }> = {
    biome: { template: "biome.json", target: "biome.json" },
    ruff: { template: "ruff.toml", target: "ruff.toml" },
    tsconfig: { template: "tsconfig.base.json", target: "tsconfig.base.json" },
  };

  for (const config of configs) {
    const mapping = configMappings[config];
    if (!mapping) {
      continue;
    }

    const targetPath = join(targetDir, mapping.target);
    const result = compareFiles(mapping.template, targetPath);

    if (result.status === "in-sync") {
      console.log(chalk.green(`  ${mapping.target} - up to date`));
    } else if (result.status === "out-of-sync" && result.diff) {
      console.log(chalk.yellow(`  ${mapping.target} - out of sync`));
      outOfSync.push({ templatePath: mapping.template, targetPath, diff: result.diff });
    }
  }

  if (outOfSync.length === 0) {
    console.log(chalk.green("\nAll files are up to date!"));
    return;
  }

  console.log(chalk.yellow(`\n${outOfSync.length} file(s) out of sync.`));

  // Show diffs if not in dry-run mode
  if (options.dryRun) {
    console.log(chalk.gray("\n--dry-run: Showing diffs without applying changes:\n"));
    for (const file of outOfSync) {
      displayDiff(file.diff, file.targetPath);
    }
    return;
  }

  // Confirm before updating
  if (!options.force) {
    for (const file of outOfSync) {
      displayDiff(file.diff, file.targetPath);
    }

    const { confirm } = await inquirer.prompt<SyncConfirmAnswer>([
      {
        type: "confirm",
        name: "confirm",
        message: "Apply these changes?",
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.gray("Sync cancelled."));
      return;
    }
  }

  // Apply updates
  console.log(chalk.blue("\nApplying updates...\n"));

  for (const file of outOfSync) {
    copyTemplate(file.templatePath, file.targetPath);
  }

  console.log(chalk.green("\nSync complete!"));
}
