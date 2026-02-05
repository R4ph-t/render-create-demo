#!/usr/bin/env node

/**
 * @render-examples/render-demo CLI
 * Scaffold Render demo projects with Cursor rules, linting configs, and templates
 */

import { program } from "commander";
import { init } from "./commands/init.js";
import { sync } from "./commands/sync.js";
import { check } from "./commands/check.js";

program
  .name("render-demo")
  .description("Scaffold Render demo projects with Cursor rules, linting configs, and templates")
  .version("1.0.0");

program
  .command("init")
  .description("Scaffold a new project with dependencies, Cursor rules, and configs")
  .argument("[name]", "Project name (creates a new directory)")
  .option("-p, --preset <preset>", "Use a specific preset (skip prompts)")
  .option("-y, --yes", "Accept all defaults")
  .option("--skip-install", "Skip package installation")
  .action(init);

program
  .command("sync")
  .description("Sync local rules with the latest package templates")
  .option("-f, --force", "Overwrite without prompting")
  .option("--dry-run", "Show changes without applying them")
  .action(sync);

program
  .command("check")
  .description("Check if local rules are up to date")
  .option("--ci", "Exit with code 1 if out of sync (for CI)")
  .action(check);

program.parse();
