#!/usr/bin/env node

/**
 * @render-examples/create-demo CLI
 * Scaffold Render demo projects with Cursor rules, linting configs, and templates
 */

import { program } from "commander";
import { init } from "./commands/init.js";
import { sync } from "./commands/sync.js";
import { check } from "./commands/check.js";

program
  .name("create-demo")
  .description("Scaffold Render demo projects with Cursor rules, linting configs, and templates")
  .version("1.0.0");

program
  .command("init")
  .description("Initialize a new project with Cursor rules and configs")
  .option("-p, --preset <preset>", "Use a specific preset (skip prompts)")
  .option("-y, --yes", "Accept all defaults")
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
