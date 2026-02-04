/**
 * Utility functions for file operations, prompts, and diff display
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { diffLines, type Change } from "diff";
import type { PresetsConfig, CompareResult } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Path to templates directory */
export const TEMPLATES_DIR = resolve(__dirname, "../templates");

/** Path to presets.json */
export const PRESETS_PATH = join(TEMPLATES_DIR, "presets.json");

/**
 * Load presets configuration
 */
export function loadPresets(): PresetsConfig {
  const content = readFileSync(PRESETS_PATH, "utf-8");
  return JSON.parse(content) as PresetsConfig;
}

/**
 * Ensure a directory exists, creating it if necessary
 */
export function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Copy a template file to the target project
 */
export function copyTemplate(templatePath: string, targetPath: string): boolean {
  const sourcePath = join(TEMPLATES_DIR, templatePath);

  if (!existsSync(sourcePath)) {
    console.log(chalk.yellow(`  Warning: Template not found: ${templatePath}`));
    return false;
  }

  ensureDir(dirname(targetPath));
  copyFileSync(sourcePath, targetPath);
  console.log(chalk.green(`  Created ${targetPath}`));
  return true;
}

/**
 * Copy a template file with variable substitution
 */
export function copyTemplateWithVars(
  templatePath: string,
  targetPath: string,
  vars: Record<string, string> = {}
): boolean {
  const sourcePath = join(TEMPLATES_DIR, templatePath);

  if (!existsSync(sourcePath)) {
    console.log(chalk.yellow(`  Warning: Template not found: ${templatePath}`));
    return false;
  }

  let content = readFileSync(sourcePath, "utf-8");

  // Replace {{VAR_NAME}} patterns
  for (const [key, value] of Object.entries(vars)) {
    content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }

  ensureDir(dirname(targetPath));
  writeFileSync(targetPath, content);
  console.log(chalk.green(`  Created ${targetPath}`));
  return true;
}

/**
 * Read a file, returning null if it doesn't exist
 */
export function readFileSafe(filePath: string): string | null {
  try {
    return readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

/**
 * Compare two files and return diff
 */
export function compareFiles(templatePath: string, localPath: string): CompareResult {
  const templateContent = readFileSafe(join(TEMPLATES_DIR, templatePath));
  const localContent = readFileSafe(localPath);

  if (!templateContent) {
    return { status: "template-missing", diff: null };
  }

  if (!localContent) {
    return { status: "local-missing", diff: null };
  }

  if (templateContent === localContent) {
    return { status: "in-sync", diff: null };
  }

  const diff = diffLines(localContent, templateContent);
  return { status: "out-of-sync", diff };
}

/**
 * Display a diff in the terminal
 */
export function displayDiff(diff: Change[], filePath: string): void {
  console.log(chalk.cyan(`\n--- ${filePath}`));

  for (const part of diff) {
    if (part.added) {
      process.stdout.write(chalk.green(part.value));
    } else if (part.removed) {
      process.stdout.write(chalk.red(part.value));
    } else {
      process.stdout.write(chalk.gray(part.value));
    }
  }
  console.log();
}

/**
 * Get the current working directory (target project)
 */
export function getTargetDir(): string {
  return process.cwd();
}

/**
 * Check if we're in a valid project directory
 */
export function isValidProjectDir(): boolean {
  const cwd = getTargetDir();
  // Check for common project indicators
  return (
    existsSync(join(cwd, "package.json")) ||
    existsSync(join(cwd, "requirements.txt")) ||
    existsSync(join(cwd, "pyproject.toml")) ||
    existsSync(join(cwd, ".git"))
  );
}

/**
 * Get list of rules for a preset
 */
export function getRulesForPreset(presetId: string): string[] {
  const presets = loadPresets();
  const preset = presets.presets[presetId];
  return preset?.rules ?? [];
}

/**
 * Get list of configs for a preset
 */
export function getConfigsForPreset(presetId: string): string[] {
  const presets = loadPresets();
  const preset = presets.presets[presetId];
  return preset?.configs ?? [];
}
