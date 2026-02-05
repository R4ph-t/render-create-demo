#!/usr/bin/env node

/**
 * create-render-app CLI
 * Scaffold and deploy applications on Render with best practices
 */

import { program } from "commander";
import { init } from "./commands/init.js";
import { sync } from "./commands/sync.js";
import { check } from "./commands/check.js";

program
  .name("create-render-app")
  .description("Scaffold and deploy applications on Render with best practices")
  .version("1.0.0");

// Default command: create a new project
program
  .argument("[name]", "Project name (creates a new directory)")
  .option("-p, --preset <preset>", "Use a specific preset (skip prompts)")
  .option("-c, --composable", "Enable composable mode")
  .option("-y, --yes", "Accept all defaults")
  .option("--skip-install", "Skip package installation")
  .action(init);

// Explicit init command (alternative syntax)
program
  .command("init")
  .description("Scaffold a new project (same as default command)")
  .argument("[name]", "Project name (creates a new directory)")
  .option("-p, --preset <preset>", "Use a specific preset (skip prompts)")
  .option("-c, --composable", "Enable composable mode")
  .option("-y, --yes", "Accept all defaults")
  .option("--skip-install", "Skip package installation")
  .action(init);

// Sync command
program
  .command("sync")
  .description("Update local Cursor rules to the latest version")
  .option("-f, --force", "Overwrite without prompting")
  .option("--dry-run", "Show changes without applying them")
  .action(sync);

// Check command
program
  .command("check")
  .description("Verify Cursor rules are up to date")
  .option("--ci", "Exit with code 1 if out of sync (for CI)")
  .action(check);

program.parse();
