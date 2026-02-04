/**
 * Init command - Initialize a new project with Cursor rules and configs
 */

import { join } from "node:path";
import chalk from "chalk";
import inquirer from "inquirer";
import type { InitOptions, Preset } from "../types.js";
import {
  loadPresets,
  copyTemplate,
  getTargetDir,
  ensureDir,
} from "../utils.js";

interface InitAnswers {
  preset: string;
  extras: string[];
}

interface CustomAnswers {
  languages: string[];
  frameworks: string[];
  extras: string[];
}

/**
 * Get the files to copy based on preset selection
 */
function getFilesForPreset(preset: Preset, extras: string[]): { rules: string[]; configs: string[] } {
  const rules = [...preset.rules];
  const configs = [...preset.configs];

  // Add extras
  if (extras.includes("github")) {
    if (!configs.includes("github")) {
      configs.push("github");
    }
  }

  return { rules, configs };
}

/**
 * Copy all selected files to the target project
 */
function copyFiles(rules: string[], configs: string[], extras: string[]): void {
  const targetDir = getTargetDir();

  console.log(chalk.blue("\nSetting up project...\n"));

  // Create .cursor/rules directory
  const rulesDir = join(targetDir, ".cursor", "rules");
  ensureDir(rulesDir);

  // Copy rule files
  for (const rule of rules) {
    copyTemplate(`cursor/rules/${rule}.mdc`, join(rulesDir, `${rule}.mdc`));
  }

  // Copy config files
  for (const config of configs) {
    switch (config) {
      case "biome":
        copyTemplate("biome.json", join(targetDir, "biome.json"));
        break;
      case "ruff":
        copyTemplate("ruff.toml", join(targetDir, "ruff.toml"));
        break;
      case "tsconfig":
        copyTemplate("tsconfig.base.json", join(targetDir, "tsconfig.base.json"));
        break;
      case "gitignore-node":
        copyTemplate("gitignore/node.gitignore", join(targetDir, ".gitignore"));
        break;
      case "gitignore-python":
        copyTemplate("gitignore/python.gitignore", join(targetDir, ".gitignore"));
        break;
      case "github":
        copyGitHubTemplates(targetDir);
        break;
    }
  }

  // Copy extras
  if (extras.includes("env")) {
    copyTemplate("env.example", join(targetDir, ".env.example"));
  }

  if (extras.includes("docker")) {
    copyTemplate("docker-compose.example.yml", join(targetDir, "docker-compose.yml"));
  }

  if (extras.includes("readme")) {
    copyTemplate("README_TEMPLATE.md", join(targetDir, "README.md"));
  }
}

/**
 * Copy GitHub templates
 */
function copyGitHubTemplates(targetDir: string): void {
  const githubDir = join(targetDir, ".github");
  const issueDir = join(githubDir, "ISSUE_TEMPLATE");
  ensureDir(issueDir);

  copyTemplate("github/PULL_REQUEST_TEMPLATE.md", join(githubDir, "PULL_REQUEST_TEMPLATE.md"));
  copyTemplate("github/ISSUE_TEMPLATE/bug_report.md", join(issueDir, "bug_report.md"));
  copyTemplate("github/ISSUE_TEMPLATE/feature_request.md", join(issueDir, "feature_request.md"));
  copyTemplate("github/CODEOWNERS", join(githubDir, "CODEOWNERS"));
}

/**
 * Main init command handler
 */
export async function init(options: InitOptions): Promise<void> {
  const presetsConfig = loadPresets();
  const presetChoices = Object.entries(presetsConfig.presets).map(([id, preset]) => ({
    name: `${preset.name} (${preset.description})`,
    value: id,
  }));

  // Add custom option
  presetChoices.push({
    name: "Custom (pick individual components)",
    value: "custom",
  });

  let selectedPreset: Preset | null = null;
  let selectedRules: string[] = [];
  let selectedConfigs: string[] = [];
  let selectedExtras: string[] = [];

  // If preset is provided via CLI, use it directly
  if (options.preset) {
    const preset = presetsConfig.presets[options.preset];
    if (!preset) {
      console.log(chalk.red(`Unknown preset: ${options.preset}`));
      console.log(chalk.yellow(`Available presets: ${Object.keys(presetsConfig.presets).join(", ")}`));
      process.exit(1);
    }
    selectedPreset = preset;
    selectedRules = preset.rules;
    selectedConfigs = preset.configs;
    selectedExtras = options.yes ? ["github", "env"] : [];
  } else {
    // Interactive mode
    const answers = await inquirer.prompt<InitAnswers>([
      {
        type: "list",
        name: "preset",
        message: "Select a stack preset:",
        choices: presetChoices,
      },
      {
        type: "checkbox",
        name: "extras",
        message: "Include extras:",
        choices: [
          { name: "GitHub templates (PR, issues)", value: "github", checked: true },
          { name: "README template", value: "readme", checked: true },
          { name: ".env.example template", value: "env", checked: true },
          { name: "docker-compose.yml (multi-service)", value: "docker", checked: false },
        ],
      },
    ]);

    selectedExtras = answers.extras;

    if (answers.preset === "custom") {
      // Custom selection flow
      const customAnswers = await inquirer.prompt<CustomAnswers>([
        {
          type: "checkbox",
          name: "languages",
          message: "Select languages:",
          choices: [
            { name: "TypeScript", value: "typescript", checked: true },
            { name: "Python", value: "python", checked: false },
          ],
        },
        {
          type: "checkbox",
          name: "frameworks",
          message: "Select frameworks/libraries:",
          choices: [
            { name: "React", value: "react" },
            { name: "Next.js", value: "nextjs" },
            { name: "Vite", value: "vite" },
            { name: "Fastify", value: "fastify" },
            { name: "Tailwind CSS", value: "tailwind" },
            { name: "Drizzle ORM", value: "drizzle" },
            { name: "SQLAlchemy", value: "sqlalchemy" },
          ],
        },
      ]);

      // Build rules list
      selectedRules = ["general"];

      if (customAnswers.languages.includes("typescript")) {
        selectedRules.push("typescript");
        selectedConfigs.push("biome", "tsconfig", "gitignore-node");
      }

      if (customAnswers.languages.includes("python")) {
        selectedRules.push("python");
        selectedConfigs.push("ruff", "gitignore-python");
      }

      selectedRules.push(...customAnswers.frameworks);

      if (selectedExtras.includes("github")) {
        selectedConfigs.push("github");
      }
    } else {
      // Use preset
      selectedPreset = presetsConfig.presets[answers.preset] ?? null;
      if (selectedPreset) {
        const files = getFilesForPreset(selectedPreset, selectedExtras);
        selectedRules = files.rules;
        selectedConfigs = files.configs;
      }
    }
  }

  // Copy all files
  copyFiles(selectedRules, selectedConfigs, selectedExtras);

  console.log(chalk.green("\nDone!"));
  console.log(chalk.gray("Run 'npx @render-examples/create-demo check' anytime to verify.\n"));
}
