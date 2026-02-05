/**
 * Init command - Scaffold a new project with dependencies, Cursor rules, and configs
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import chalk from "chalk";
import inquirer from "inquirer";
import type {
  InitOptions,
  Preset,
  BlueprintEnvVar,
  BlueprintService,
  BlueprintDatabase,
  BlueprintKeyValue,
  ComposableSelection,
  ComponentsConfig,
  FrontendComponent,
  ApiComponent,
  WorkerComponent,
} from "../types.js";
import {
  loadPresets,
  copyTemplate,
  copyTemplateWithVars,
  ensureDir,
} from "../utils.js";

interface InitAnswers {
  projectName: string;
  preset: string;
  extras: string[];
}

interface CustomAnswers {
  languages: string[];
  frameworks: string[];
}

interface ComposableAnswers {
  frontend: string;
  apis: string[];
  workers: string[];
  database: string;
  cache: string;
  extras: string[];
}

/**
 * Validate project name
 */
function validateProjectName(name: string): boolean | string {
  if (!name) {
    return "Project name is required";
  }
  if (!/^[a-z0-9-_]+$/i.test(name)) {
    return "Project name can only contain letters, numbers, hyphens, and underscores";
  }
  if (existsSync(name)) {
    return `Directory "${name}" already exists`;
  }
  return true;
}

/**
 * Get the files to copy based on preset selection
 */
function getFilesForPreset(
  preset: Preset,
  _extras: string[]
): { rules: string[]; configs: string[] } {
  const rules = [...preset.rules];
  const configs = [...preset.configs];
  return { rules, configs };
}

/**
 * Run the create command for a preset (e.g., create-next-app)
 */
function runCreateCommand(
  createCommand: string,
  projectName: string
): void {
  const command = createCommand.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
  console.log(chalk.blue(`\nRunning: ${chalk.bold(command)}\n`));
  execSync(command, { stdio: "inherit" });
}

/**
 * Add dependencies to an existing project
 */
function addDependencies(
  projectDir: string,
  deps: string[],
  dev: boolean,
  packageManager: string
): void {
  if (deps.length === 0) return;

  const flag = dev ? "-D" : "";
  const depsStr = deps.join(" ");
  const cmd = `${packageManager} install ${flag} ${depsStr}`.trim();

  console.log(chalk.gray(`  ${cmd}`));
  execSync(cmd, { cwd: projectDir, stdio: "inherit" });
}

/**
 * Add scripts to package.json
 */
function addScriptsToPackageJson(
  projectDir: string,
  scripts: Record<string, string>
): void {
  const pkgPath = join(projectDir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

  pkg.scripts = { ...pkg.scripts, ...scripts };

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(chalk.green("  Updated package.json scripts"));
}

/**
 * Delete files after create command
 */
function deletePostCreateFiles(
  projectDir: string,
  files: string[]
): void {
  for (const filePath of files) {
    const fullPath = join(projectDir, filePath);
    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
      console.log(chalk.yellow(`  Deleted ${filePath}`));
    }
  }
}

/**
 * Copy post-create files with variable substitution (text files only)
 */
function copyPostCreateFiles(
  projectDir: string,
  files: Record<string, string>,
  projectName: string
): void {
  const binaryExtensions = [".png", ".ico", ".jpg", ".jpeg", ".gif", ".webp", ".woff", ".woff2", ".ttf", ".eot"];

  for (const [targetPath, templatePath] of Object.entries(files)) {
    const fullTargetPath = join(projectDir, targetPath);
    ensureDir(dirname(fullTargetPath));

    const isBinary = binaryExtensions.some((ext) => targetPath.endsWith(ext));

    if (isBinary) {
      // Copy binary files directly without substitution
      copyTemplate(templatePath, fullTargetPath);
    } else {
      // Copy text files with variable substitution
      copyTemplateWithVars(templatePath, fullTargetPath, {
        PROJECT_NAME: projectName,
      });
    }
  }
}

/**
 * Generate package.json for presets without createCommand
 */
function generatePackageJson(
  projectName: string,
  preset: Preset
): Record<string, unknown> {
  return {
    name: projectName,
    version: "0.1.0",
    private: true,
    type: "module",
    scripts: preset.scripts ?? {},
    dependencies: {},
    devDependencies: {},
  };
}

/**
 * Generate requirements.txt content
 */
function generateRequirementsTxt(preset: Preset): string {
  return (preset.pythonDependencies ?? []).join("\n") + "\n";
}

/**
 * Install npm dependencies for presets without createCommand
 */
function installNpmDependencies(
  projectDir: string,
  preset: Preset,
  packageManager: string
): void {
  const deps = preset.dependencies ?? [];
  const devDeps = preset.devDependencies ?? [];

  console.log(chalk.blue("\nInstalling dependencies...\n"));

  if (deps.length > 0) {
    const depsStr = deps.join(" ");
    console.log(chalk.gray(`  ${packageManager} install ${depsStr}`));
    execSync(`${packageManager} install ${depsStr}`, {
      cwd: projectDir,
      stdio: "inherit",
    });
  }

  if (devDeps.length > 0) {
    const devDepsStr = devDeps.join(" ");
    console.log(chalk.gray(`  ${packageManager} install -D ${devDepsStr}`));
    execSync(`${packageManager} install -D ${devDepsStr}`, {
      cwd: projectDir,
      stdio: "inherit",
    });
  }
}

/**
 * Install Python dependencies
 */
function installPythonDependencies(projectDir: string): void {
  console.log(chalk.blue("\nSetting up Python environment...\n"));

  // Create virtual environment
  console.log(chalk.gray("  Creating virtual environment..."));
  execSync("python3 -m venv .venv", { cwd: projectDir, stdio: "inherit" });

  // Install dependencies
  const pipCmd =
    process.platform === "win32" ? ".venv\\Scripts\\pip" : ".venv/bin/pip";

  console.log(chalk.gray(`  ${pipCmd} install -r requirements.txt`));
  execSync(`${pipCmd} install -r requirements.txt`, {
    cwd: projectDir,
    stdio: "inherit",
  });
}

/**
 * Generate render.yaml Blueprint content
 */
function generateRenderYaml(projectName: string, preset: Preset): string {
  const blueprint = preset.blueprint;
  if (!blueprint) return "";

  const replacePlaceholders = (str: string): string =>
    str.replace(/\{\{PROJECT_NAME\}\}/g, projectName);

  const generateEnvVarYaml = (
    envVar: BlueprintEnvVar,
    indent: string
  ): string[] => {
    const lines: string[] = [];
    if ("fromDatabase" in envVar) {
      lines.push(`${indent}- key: ${envVar.key}`);
      lines.push(`${indent}  fromDatabase:`);
      lines.push(`${indent}    name: ${replacePlaceholders(envVar.fromDatabase.name)}`);
      lines.push(`${indent}    property: ${envVar.fromDatabase.property}`);
    } else if ("fromService" in envVar) {
      lines.push(`${indent}- key: ${envVar.key}`);
      lines.push(`${indent}  fromService:`);
      lines.push(`${indent}    type: ${envVar.fromService.type}`);
      lines.push(`${indent}    name: ${replacePlaceholders(envVar.fromService.name)}`);
      if (envVar.fromService.property) {
        lines.push(`${indent}    property: ${envVar.fromService.property}`);
      }
      if (envVar.fromService.envVarKey) {
        lines.push(`${indent}    envVarKey: ${envVar.fromService.envVarKey}`);
      }
    } else {
      lines.push(`${indent}- key: ${envVar.key}`);
      if (envVar.value !== undefined) {
        lines.push(`${indent}  value: "${envVar.value}"`);
      }
      if (envVar.generateValue) {
        lines.push(`${indent}  generateValue: true`);
      }
      if (envVar.sync !== undefined) {
        lines.push(`${indent}  sync: ${envVar.sync}`);
      }
    }
    return lines;
  };

  const generateServiceYaml = (
    service: BlueprintService,
    indent: string
  ): string[] => {
    const lines: string[] = [];
    const serviceName = service.name ?? projectName;

    lines.push(`${indent}- type: ${service.type}`);
    lines.push(`${indent}  name: ${serviceName}`);
    lines.push(`${indent}  runtime: ${service.runtime}`);

    if (service.plan) {
      lines.push(`${indent}  plan: ${service.plan}`);
    }
    if (service.rootDir) {
      lines.push(`${indent}  rootDir: ${service.rootDir}`);
    }
    if (service.buildCommand) {
      lines.push(`${indent}  buildCommand: ${service.buildCommand}`);
    }
    if (service.startCommand) {
      lines.push(`${indent}  startCommand: ${service.startCommand}`);
    }
    if (service.staticPublishPath) {
      lines.push(`${indent}  staticPublishPath: ${service.staticPublishPath}`);
    }
    if (service.healthCheckPath) {
      lines.push(`${indent}  healthCheckPath: ${service.healthCheckPath}`);
    }
    if (service.routes && service.routes.length > 0) {
      lines.push(`${indent}  routes:`);
      for (const route of service.routes) {
        lines.push(`${indent}    - type: ${route.type}`);
        lines.push(`${indent}      source: ${route.source}`);
        lines.push(`${indent}      destination: ${route.destination}`);
      }
    }
    if (service.envVars && service.envVars.length > 0) {
      lines.push(`${indent}  envVars:`);
      for (const envVar of service.envVars) {
        lines.push(...generateEnvVarYaml(envVar, `${indent}    `));
      }
    }
    return lines;
  };

  const generateDatabaseYaml = (
    db: BlueprintDatabase,
    indent: string
  ): string[] => {
    const lines: string[] = [];
    lines.push(`${indent}- name: ${replacePlaceholders(db.name)}`);
    if (db.plan) {
      lines.push(`${indent}  plan: ${db.plan}`);
    }
    if (db.postgresMajorVersion) {
      lines.push(`${indent}  postgresMajorVersion: "${db.postgresMajorVersion}"`);
    }
    return lines;
  };

  const yaml: string[] = [];
  const hasMultipleResources =
    (blueprint.services?.length ?? 0) + (blueprint.databases?.length ?? 0) > 1;

  if (hasMultipleResources) {
    yaml.push("# Render Blueprint - https://render.com/docs/blueprint-spec");
    yaml.push("# Uses projects/environments for grouped resource management");
    yaml.push("");
    yaml.push("projects:");
    yaml.push(`  - name: ${projectName}`);
    yaml.push("    environments:");
    yaml.push("      - name: production");

    if (blueprint.services && blueprint.services.length > 0) {
      yaml.push("        services:");
      for (const service of blueprint.services) {
        yaml.push(...generateServiceYaml(service, "          "));
      }
    }
    if (blueprint.databases && blueprint.databases.length > 0) {
      yaml.push("        databases:");
      for (const db of blueprint.databases) {
        yaml.push(...generateDatabaseYaml(db, "          "));
      }
    }
  } else {
    yaml.push("# Render Blueprint - https://render.com/docs/blueprint-spec");
    yaml.push("");

    if (blueprint.services && blueprint.services.length > 0) {
      yaml.push("services:");
      for (const service of blueprint.services) {
        yaml.push(...generateServiceYaml(service, "  "));
      }
    }
    if (blueprint.databases && blueprint.databases.length > 0) {
      yaml.push("");
      yaml.push("databases:");
      for (const db of blueprint.databases) {
        yaml.push(...generateDatabaseYaml(db, "  "));
      }
    }
  }

  return yaml.join("\n") + "\n";
}

/**
 * Copy config files and Cursor rules
 */
function copyConfigFiles(
  projectDir: string,
  rules: string[],
  configs: string[],
  extras: string[],
  projectName: string
): void {
  console.log(chalk.blue("\nAdding project configs...\n"));

  // Create .cursor/rules directory
  const rulesDir = join(projectDir, ".cursor", "rules");
  ensureDir(rulesDir);

  // Copy rule files
  for (const rule of rules) {
    copyTemplate(`cursor/rules/${rule}.mdc`, join(rulesDir, `${rule}.mdc`));
  }

  // Copy config files
  for (const config of configs) {
    switch (config) {
      case "biome":
        copyTemplate("biome.json", join(projectDir, "biome.json"));
        break;
      case "ruff":
        copyTemplate("ruff.toml", join(projectDir, "ruff.toml"));
        break;
      case "tsconfig":
        copyTemplate("tsconfig.base.json", join(projectDir, "tsconfig.json"));
        break;
      case "gitignore-node":
        // Only copy if .gitignore doesn't exist (create-next-app creates one)
        if (!existsSync(join(projectDir, ".gitignore"))) {
          copyTemplate("gitignore/node.gitignore", join(projectDir, ".gitignore"));
        }
        break;
      case "gitignore-python":
        copyTemplate("gitignore/python.gitignore", join(projectDir, ".gitignore"));
        break;
      case "github":
        copyGitHubTemplates(projectDir);
        break;
    }
  }

  // Copy extras
  if (extras.includes("env")) {
    copyTemplate("env.example", join(projectDir, ".env.example"));
  }
  if (extras.includes("docker")) {
    copyTemplate("docker-compose.example.yml", join(projectDir, "docker-compose.yml"));
  }
}

/**
 * Copy GitHub templates
 */
function copyGitHubTemplates(projectDir: string): void {
  const githubDir = join(projectDir, ".github");
  const issueDir = join(githubDir, "ISSUE_TEMPLATE");
  ensureDir(issueDir);

  copyTemplate("github/PULL_REQUEST_TEMPLATE.md", join(githubDir, "PULL_REQUEST_TEMPLATE.md"));
  copyTemplate("github/ISSUE_TEMPLATE/bug_report.md", join(issueDir, "bug_report.md"));
  copyTemplate("github/ISSUE_TEMPLATE/feature_request.md", join(issueDir, "feature_request.md"));
  copyTemplate("github/CODEOWNERS", join(githubDir, "CODEOWNERS"));
}

/**
 * Initialize git repository (if not already initialized)
 */
function initGit(projectDir: string): void {
  if (!existsSync(join(projectDir, ".git"))) {
    console.log(chalk.blue("\nInitializing git repository...\n"));
    execSync("git init", { cwd: projectDir, stdio: "pipe" });
    console.log(chalk.green("  Initialized git repository"));
  }
}

// ============================================================================
// Composable Project Scaffolding
// ============================================================================

/**
 * Scaffold a frontend component
 */
async function scaffoldFrontend(
  projectDir: string,
  componentId: string,
  component: FrontendComponent,
  projectName: string,
  skipInstall: boolean
): Promise<void> {
  const subdir = join(projectDir, component.subdir);
  const subdirName = `${projectName}-frontend`;

  console.log(chalk.blue(`\nScaffolding frontend: ${component.name}...\n`));

  // Run create command in parent dir, it creates its own folder
  const createCommand = component.createCommand.replace(/\{\{PROJECT_NAME\}\}/g, subdirName);
  console.log(chalk.gray(`  ${createCommand}`));
  execSync(createCommand, { cwd: projectDir, stdio: "inherit" });

  // Rename to subdir name
  const createdDir = join(projectDir, subdirName);
  if (existsSync(createdDir) && createdDir !== subdir) {
    execSync(`mv "${subdirName}" "${component.subdir}"`, { cwd: projectDir, stdio: "pipe" });
  }

  if (!skipInstall) {
    // Add post-create dependencies
    const postDeps = component.postCreateDependencies ?? [];
    const postDevDeps = component.postCreateDevDependencies ?? [];

    if (postDeps.length > 0) {
      addDependencies(subdir, postDeps, false, "npm");
    }
    if (postDevDeps.length > 0) {
      addDependencies(subdir, postDevDeps, true, "npm");
    }
  }

  // Add post-create scripts
  if (component.postCreateScripts) {
    addScriptsToPackageJson(subdir, component.postCreateScripts);
  }

  // Delete unwanted files
  if (component.postCreateDelete) {
    deletePostCreateFiles(subdir, component.postCreateDelete);
  }

  // Copy post-create files
  if (component.postCreateFiles) {
    copyPostCreateFiles(subdir, component.postCreateFiles, projectName);
  }

  console.log(chalk.green(`  ✓ Frontend scaffolded in ${component.subdir}/`));
}

/**
 * Scaffold an API component
 */
async function scaffoldApi(
  projectDir: string,
  componentId: string,
  component: ApiComponent,
  projectName: string,
  skipInstall: boolean
): Promise<void> {
  const subdir = join(projectDir, component.subdir);
  ensureDir(subdir);

  console.log(chalk.blue(`\nScaffolding API: ${component.name}...\n`));

  if (component.runtime === "python") {
    // Python API
    const pythonDeps = component.pythonDependencies ?? [];
    writeFileSync(join(subdir, "requirements.txt"), pythonDeps.join("\n") + "\n");
    console.log(chalk.green(`  Created requirements.txt`));

    if (component.scaffoldFiles) {
      copyPostCreateFiles(subdir, component.scaffoldFiles, projectName);
    }

    if (!skipInstall) {
      installPythonDependencies(subdir);
    }
  } else {
    // Node API
    const packageJson = {
      name: `${projectName}-${component.subdir}`,
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: component.scripts ?? {},
      dependencies: {},
      devDependencies: {},
    };
    writeFileSync(join(subdir, "package.json"), JSON.stringify(packageJson, null, 2) + "\n");
    console.log(chalk.green(`  Created package.json`));

    if (component.scaffoldFiles) {
      copyPostCreateFiles(subdir, component.scaffoldFiles, projectName);
    }

    if (!skipInstall) {
      const deps = component.dependencies ?? [];
      const devDeps = component.devDependencies ?? [];

      if (deps.length > 0) {
        console.log(chalk.gray(`  npm install ${deps.join(" ")}`));
        execSync(`npm install ${deps.join(" ")}`, { cwd: subdir, stdio: "inherit" });
      }
      if (devDeps.length > 0) {
        console.log(chalk.gray(`  npm install -D ${devDeps.join(" ")}`));
        execSync(`npm install -D ${devDeps.join(" ")}`, { cwd: subdir, stdio: "inherit" });
      }
    }
  }

  console.log(chalk.green(`  ✓ API scaffolded in ${component.subdir}/`));
}

/**
 * Scaffold a worker component
 */
async function scaffoldWorker(
  projectDir: string,
  componentId: string,
  component: WorkerComponent,
  projectName: string,
  skipInstall: boolean
): Promise<void> {
  // Use unique subdir name to avoid conflicts
  const subdirName = component.workerType === "workflow"
    ? `${component.subdir}-${component.runtime === "python" ? "py" : "ts"}`
    : `${component.subdir}-${component.runtime === "python" ? "py" : "ts"}`;
  const subdir = join(projectDir, subdirName);
  ensureDir(subdir);

  console.log(chalk.blue(`\nScaffolding ${component.workerType}: ${component.name}...\n`));

  if (component.runtime === "python") {
    // Python worker
    const pythonDeps = component.pythonDependencies ?? [];
    writeFileSync(join(subdir, "requirements.txt"), pythonDeps.join("\n") + "\n");
    console.log(chalk.green(`  Created requirements.txt`));

    if (component.scaffoldFiles) {
      copyPostCreateFiles(subdir, component.scaffoldFiles, projectName);
    }

    if (!skipInstall) {
      installPythonDependencies(subdir);
    }
  } else {
    // Node worker
    const packageJson = {
      name: `${projectName}-${subdirName}`,
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: component.scripts ?? {},
      dependencies: {},
      devDependencies: {},
    };
    writeFileSync(join(subdir, "package.json"), JSON.stringify(packageJson, null, 2) + "\n");
    console.log(chalk.green(`  Created package.json`));

    // Copy tsconfig for TypeScript workers
    copyTemplate("tsconfig.base.json", join(subdir, "tsconfig.json"));

    if (component.scaffoldFiles) {
      copyPostCreateFiles(subdir, component.scaffoldFiles, projectName);
    }

    if (!skipInstall) {
      const deps = component.dependencies ?? [];
      const devDeps = component.devDependencies ?? [];

      if (deps.length > 0) {
        console.log(chalk.gray(`  npm install ${deps.join(" ")}`));
        execSync(`npm install ${deps.join(" ")}`, { cwd: subdir, stdio: "inherit" });
      }
      if (devDeps.length > 0) {
        console.log(chalk.gray(`  npm install -D ${devDeps.join(" ")}`));
        execSync(`npm install -D ${devDeps.join(" ")}`, { cwd: subdir, stdio: "inherit" });
      }
    }
  }

  console.log(chalk.green(`  ✓ ${component.workerType} scaffolded in ${subdirName}/`));
}

/**
 * Generate composed render.yaml Blueprint
 */
function generateComposedBlueprint(
  projectName: string,
  selection: ComposableSelection,
  components: ComponentsConfig
): string {
  const yaml: string[] = [];
  const services: string[] = [];
  const databases: string[] = [];
  const keyValues: string[] = [];

  const replacePlaceholders = (str: string): string =>
    str.replace(/\{\{PROJECT_NAME\}\}/g, projectName);

  // Helper to generate service YAML
  const addService = (
    name: string,
    type: string,
    runtime: string,
    rootDir: string,
    buildCommand: string,
    startCommand?: string,
    staticPublishPath?: string,
    healthCheckPath?: string,
    envVars?: BlueprintEnvVar[],
    routes?: Array<{ type: string; source: string; destination: string }>,
    schedule?: string
  ): void => {
    services.push(`          - type: ${type}`);
    services.push(`            name: ${name}`);
    services.push(`            runtime: ${runtime}`);
    services.push(`            rootDir: ${rootDir}`);
    if (buildCommand) services.push(`            buildCommand: ${buildCommand}`);
    if (startCommand) services.push(`            startCommand: ${startCommand}`);
    if (staticPublishPath) services.push(`            staticPublishPath: ${staticPublishPath}`);
    if (healthCheckPath) services.push(`            healthCheckPath: ${healthCheckPath}`);
    if (schedule) services.push(`            schedule: "${schedule}"`);
    if (routes && routes.length > 0) {
      services.push(`            routes:`);
      for (const route of routes) {
        services.push(`              - type: ${route.type}`);
        services.push(`                source: ${route.source}`);
        services.push(`                destination: ${route.destination}`);
      }
    }
    if (envVars && envVars.length > 0) {
      services.push(`            envVars:`);
      for (const envVar of envVars) {
        if ("fromDatabase" in envVar) {
          services.push(`              - key: ${envVar.key}`);
          services.push(`                fromDatabase:`);
          services.push(`                  name: ${replacePlaceholders(envVar.fromDatabase.name)}`);
          services.push(`                  property: ${envVar.fromDatabase.property}`);
        } else if ("value" in envVar && envVar.value !== undefined) {
          services.push(`              - key: ${envVar.key}`);
          services.push(`                value: "${envVar.value}"`);
        }
      }
    }
  };

  // Add frontend service
  if (selection.frontend) {
    const comp = components.frontends[selection.frontend];
    if (comp?.blueprint) {
      const bp = comp.blueprint;
      addService(
        `${projectName}-frontend`,
        bp.type,
        bp.runtime,
        comp.subdir,
        bp.buildCommand,
        bp.startCommand,
        bp.staticPublishPath,
        bp.healthCheckPath,
        bp.envVars,
        bp.routes
      );
    }
  }

  // Add API services
  for (const apiId of selection.apis) {
    const comp = components.apis[apiId];
    if (comp?.blueprint) {
      const bp = comp.blueprint;
      // Add DATABASE_URL env var if database selected
      const envVars: BlueprintEnvVar[] = [...(bp.envVars ?? [])];
      if (selection.database) {
        envVars.push({
          key: "DATABASE_URL",
          fromDatabase: { name: `${projectName}-db`, property: "connectionString" },
        });
      }
      addService(
        `${projectName}-${comp.subdir}`,
        bp.type,
        bp.runtime,
        comp.subdir,
        bp.buildCommand,
        bp.startCommand,
        undefined,
        bp.healthCheckPath,
        envVars
      );
    }
  }

  // Add worker services (excluding workflows which aren't blueprint-supported yet)
  for (const workerId of selection.workers) {
    const comp = components.workers[workerId];
    if (comp?.blueprint && comp.workerType !== "workflow") {
      const bp = comp.blueprint;
      const subdirName = `${comp.subdir}-${comp.runtime === "python" ? "py" : "ts"}`;
      // Add DATABASE_URL env var if database selected
      const envVars: BlueprintEnvVar[] = [...(bp.envVars ?? [])];
      if (selection.database) {
        envVars.push({
          key: "DATABASE_URL",
          fromDatabase: { name: `${projectName}-db`, property: "connectionString" },
        });
      }
      addService(
        `${projectName}-${subdirName}`,
        bp.type,
        bp.runtime,
        subdirName,
        bp.buildCommand,
        bp.startCommand,
        undefined,
        undefined,
        envVars,
        undefined,
        bp.schedule
      );
    }
  }

  // Add database
  if (selection.database) {
    const comp = components.databases[selection.database];
    if (comp?.blueprint) {
      databases.push(`          - name: ${replacePlaceholders(comp.blueprint.name)}`);
      if (comp.blueprint.postgresMajorVersion) {
        databases.push(`            postgresMajorVersion: "${comp.blueprint.postgresMajorVersion}"`);
      }
    }
  }

  // Add cache/keyval
  if (selection.cache) {
    const comp = components.caches[selection.cache];
    if (comp?.blueprint) {
      keyValues.push(`          - name: ${replacePlaceholders(comp.blueprint.name)}`);
    }
  }

  // Build the final YAML
  yaml.push("# Render Blueprint - https://render.com/docs/blueprint-spec");
  yaml.push("# Uses projects/environments for grouped resource management");
  yaml.push("");
  yaml.push("projects:");
  yaml.push(`  - name: ${projectName}`);
  yaml.push("    environments:");
  yaml.push("      - name: production");

  if (services.length > 0) {
    yaml.push("        services:");
    yaml.push(...services);
  }

  if (databases.length > 0) {
    yaml.push("        databases:");
    yaml.push(...databases);
  }

  if (keyValues.length > 0) {
    yaml.push("        keyValues:");
    yaml.push(...keyValues);
  }

  return yaml.join("\n") + "\n";
}

/**
 * Collect and merge rules from all selected components
 */
function collectRules(
  selection: ComposableSelection,
  components: ComponentsConfig
): string[] {
  const rules = new Set<string>(["general"]);

  if (selection.frontend) {
    const comp = components.frontends[selection.frontend];
    for (const rule of comp?.rules ?? []) {
      rules.add(rule);
    }
  }

  for (const apiId of selection.apis) {
    const comp = components.apis[apiId];
    for (const rule of comp?.rules ?? []) {
      rules.add(rule);
    }
  }

  for (const workerId of selection.workers) {
    const comp = components.workers[workerId];
    for (const rule of comp?.rules ?? []) {
      rules.add(rule);
    }
  }

  return Array.from(rules);
}

/**
 * Collect configs from all selected components
 */
function collectConfigs(
  selection: ComposableSelection,
  components: ComponentsConfig
): string[] {
  const configs = new Set<string>();

  if (selection.frontend) {
    const comp = components.frontends[selection.frontend];
    for (const config of comp?.configs ?? []) {
      configs.add(config);
    }
  }

  for (const apiId of selection.apis) {
    const comp = components.apis[apiId];
    for (const config of comp?.configs ?? []) {
      configs.add(config);
    }
  }

  for (const workerId of selection.workers) {
    const comp = components.workers[workerId];
    for (const config of comp?.configs ?? []) {
      configs.add(config);
    }
  }

  return Array.from(configs);
}

/**
 * Scaffold a composable project with selected components
 */
async function scaffoldComposableProject(
  selection: ComposableSelection,
  components: ComponentsConfig,
  skipInstall: boolean
): Promise<void> {
  const projectDir = resolve(process.cwd(), selection.projectName);

  console.log(chalk.blue(`\nCreating composable project: ${chalk.bold(selection.projectName)}\n`));
  ensureDir(projectDir);

  // Create root README
  const structureLines: string[] = [];
  if (selection.frontend) {
    structureLines.push("- `frontend/` - Frontend application");
  }
  for (const apiId of selection.apis) {
    const comp = components.apis[apiId];
    structureLines.push(`- \`${comp?.subdir}/\` - ${comp?.name}`);
  }
  for (const workerId of selection.workers) {
    const comp = components.workers[workerId];
    const subdirName = `${comp?.subdir}-${comp?.runtime === "python" ? "py" : "ts"}`;
    structureLines.push(`- \`${subdirName}/\` - ${comp?.name}`);
  }

  const readmeContent = `# ${selection.projectName}

A composable demo project scaffolded with render-demo.

## Structure

${structureLines.join("\n")}

## Getting Started

1. Set up environment variables (copy \`.env.example\` to \`.env\` in each service)
2. Install dependencies in each service directory
3. Run \`render blueprint launch\` to deploy to Render

## Deploy to Render

This project includes a \`render.yaml\` Blueprint for easy deployment.
`;
  writeFileSync(join(projectDir, "README.md"), readmeContent);

  // Create root .gitignore
  const gitignoreContent = `# Dependencies
node_modules/
.venv/
__pycache__/

# Build outputs
dist/
build/
out/
.next/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
`;
  writeFileSync(join(projectDir, ".gitignore"), gitignoreContent);

  // Scaffold frontend
  if (selection.frontend) {
    const comp = components.frontends[selection.frontend];
    if (comp) {
      await scaffoldFrontend(projectDir, selection.frontend, comp, selection.projectName, skipInstall);
    }
  }

  // Scaffold APIs
  for (const apiId of selection.apis) {
    const comp = components.apis[apiId];
    if (comp) {
      await scaffoldApi(projectDir, apiId, comp, selection.projectName, skipInstall);
    }
  }

  // Scaffold workers
  for (const workerId of selection.workers) {
    const comp = components.workers[workerId];
    if (comp) {
      await scaffoldWorker(projectDir, workerId, comp, selection.projectName, skipInstall);
    }
  }

  // Generate render.yaml Blueprint
  const hasServices = selection.frontend || selection.apis.length > 0 || selection.workers.length > 0;
  if (hasServices || selection.database || selection.cache) {
    const renderYaml = generateComposedBlueprint(selection.projectName, selection, components);
    writeFileSync(join(projectDir, "render.yaml"), renderYaml);
    console.log(chalk.green(`\n  Created render.yaml`));
  }

  // Copy Cursor rules to root
  const rules = collectRules(selection, components);
  const rulesDir = join(projectDir, ".cursor", "rules");
  ensureDir(rulesDir);
  for (const rule of rules) {
    try {
      copyTemplate(`cursor/rules/${rule}.mdc`, join(rulesDir, `${rule}.mdc`));
    } catch {
      // Rule file might not exist, skip
    }
  }
  console.log(chalk.green(`  Added ${rules.length} Cursor rules`));

  // Copy extras
  if (selection.extras.includes("env")) {
    const envContent = `# Environment variables
# Copy this file to .env and fill in the values

DATABASE_URL=
RENDER_API_KEY=
`;
    writeFileSync(join(projectDir, ".env.example"), envContent);
    console.log(chalk.green(`  Created .env.example`));
  }

  if (selection.extras.includes("docker")) {
    copyTemplate("docker-compose.example.yml", join(projectDir, "docker-compose.yml"));
    console.log(chalk.green(`  Created docker-compose.yml`));
  }

  // Initialize git
  initGit(projectDir);

  // Done!
  console.log(chalk.green("\n✓ Composable project created successfully!\n"));
  console.log(chalk.white("Project structure:\n"));
  console.log(chalk.cyan(`  ${selection.projectName}/`));
  if (selection.frontend) {
    console.log(chalk.cyan(`    frontend/`));
  }
  for (const apiId of selection.apis) {
    const comp = components.apis[apiId];
    if (comp) {
      console.log(chalk.cyan(`    ${comp.subdir}/`));
    }
  }
  for (const workerId of selection.workers) {
    const comp = components.workers[workerId];
    if (comp) {
      const subdirName = `${comp.subdir}-${comp.runtime === "python" ? "py" : "ts"}`;
      console.log(chalk.cyan(`    ${subdirName}/`));
    }
  }

  console.log(chalk.white("\nNext steps:\n"));
  console.log(chalk.cyan(`  cd ${selection.projectName}`));
  console.log(chalk.cyan(`  # Start each service in its directory`));
  console.log(chalk.cyan(`  render blueprint launch  # Deploy to Render`));
  console.log();
}

/**
 * Main init command handler
 */
export async function init(
  nameArg: string | undefined,
  options: InitOptions
): Promise<void> {
  const presetsConfig = loadPresets();
  const presetChoices = Object.entries(presetsConfig.presets).map(
    ([id, preset]) => ({
      name: `${preset.name} (${preset.description})`,
      value: id,
    })
  );

  presetChoices.push({
    name: "Custom (pick individual components)",
    value: "custom",
  });

  let projectName = nameArg ?? options.name;
  let selectedPreset: Preset | null = null;
  let selectedPresetId: string | null = null;
  let selectedRules: string[] = [];
  let selectedConfigs: string[] = [];
  let selectedExtras: string[] = [];

  // Interactive prompts
  if (!projectName || !options.preset) {
    // biome-ignore lint/suspicious/noExplicitAny: inquirer types are complex
    const questions: any[] = [];

    if (!projectName) {
      questions.push({
        type: "input",
        name: "projectName",
        message: "What is your project name?",
        validate: validateProjectName,
        default: "my-demo",
      });
    }

    if (!options.preset) {
      questions.push({
        type: "list",
        name: "preset",
        message: "Select a stack preset:",
        choices: presetChoices,
      });

      questions.push({
        type: "checkbox",
        name: "extras",
        message: "Include extras:",
        choices: [
          { name: ".env.example template", value: "env", checked: true },
          { name: "docker-compose.yml", value: "docker", checked: false },
        ],
      });
    }

    const answers = await inquirer.prompt<InitAnswers>(questions);

    projectName = projectName ?? answers.projectName;
    selectedPresetId = options.preset ?? answers.preset;
    selectedExtras = answers.extras ?? (options.yes ? ["env"] : []);
  } else {
    selectedPresetId = options.preset;
    selectedExtras = options.yes ? ["env"] : [];
  }

  // Validate preset
  if (selectedPresetId && selectedPresetId !== "custom") {
    selectedPreset = presetsConfig.presets[selectedPresetId] ?? null;
    if (!selectedPreset) {
      console.log(chalk.red(`Unknown preset: ${selectedPresetId}`));
      console.log(
        chalk.yellow(`Available presets: ${Object.keys(presetsConfig.presets).join(", ")}`)
      );
      process.exit(1);
    }
  }

  // Handle custom/composable preset
  if (selectedPresetId === "custom") {
    const components = presetsConfig.components;
    if (!components) {
      console.log(chalk.red("Components configuration not found."));
      process.exit(1);
    }

    // Build choices for each component category
    const frontendChoices = [
      { name: "None", value: "none" },
      ...Object.entries(components.frontends).map(([id, comp]) => ({
        name: `${comp.name} - ${comp.description}`,
        value: id,
      })),
    ];

    const apiChoices = Object.entries(components.apis).map(([id, comp]) => ({
      name: `${comp.name} - ${comp.description}`,
      value: id,
    }));

    const workerChoices = Object.entries(components.workers).map(([id, comp]) => ({
      name: `${comp.name} - ${comp.description}`,
      value: id,
    }));

    const databaseChoices = [
      { name: "None", value: "none" },
      ...Object.entries(components.databases).map(([id, comp]) => ({
        name: `${comp.name} - ${comp.description}`,
        value: id,
      })),
    ];

    const cacheChoices = [
      { name: "None", value: "none" },
      ...Object.entries(components.caches).map(([id, comp]) => ({
        name: `${comp.name} - ${comp.description}`,
        value: id,
      })),
    ];

    // Multi-step prompts for composable selection
    const composableAnswers = await inquirer.prompt<ComposableAnswers>([
      {
        type: "list",
        name: "frontend",
        message: "Select frontend:",
        choices: frontendChoices,
      },
      {
        type: "checkbox",
        name: "apis",
        message: "Select API backends (can pick multiple):",
        choices: apiChoices,
      },
      {
        type: "checkbox",
        name: "workers",
        message: "Select async work (can pick multiple):",
        choices: workerChoices,
      },
      {
        type: "list",
        name: "database",
        message: "Add database?",
        choices: databaseChoices,
      },
      {
        type: "list",
        name: "cache",
        message: "Add cache?",
        choices: cacheChoices,
      },
      {
        type: "checkbox",
        name: "extras",
        message: "Include extras:",
        choices: [
          { name: ".env.example template", value: "env", checked: true },
          { name: "docker-compose.yml", value: "docker", checked: false },
        ],
      },
    ]);

    const selection: ComposableSelection = {
      projectName,
      frontend: composableAnswers.frontend === "none" ? null : composableAnswers.frontend,
      apis: composableAnswers.apis,
      workers: composableAnswers.workers,
      database: composableAnswers.database === "none" ? null : composableAnswers.database,
      cache: composableAnswers.cache === "none" ? null : composableAnswers.cache,
      extras: composableAnswers.extras,
    };

    // Scaffold the composable project
    await scaffoldComposableProject(selection, components, options.skipInstall ?? false);
    return;
  }

  // Get files for preset
  if (selectedPreset) {
    const files = getFilesForPreset(selectedPreset, selectedExtras);
    selectedRules = files.rules;
    selectedConfigs = files.configs;
  }

  const projectDir = resolve(process.cwd(), projectName);
  const isPython = selectedPreset?.packageManager === "pip";
  const hasCreateCommand = !!selectedPreset?.createCommand;

  // === SCAFFOLDING FLOW ===

  if (hasCreateCommand && selectedPreset) {
    // Flow 1: Use official create command (create-next-app, create-vite, etc.)
    runCreateCommand(selectedPreset.createCommand!, projectName);

    if (!options.skipInstall) {
      // Add post-create dependencies
      const postDeps = selectedPreset.postCreateDependencies ?? [];
      const postDevDeps = selectedPreset.postCreateDevDependencies ?? [];
      const packageManager = selectedPreset.packageManager ?? "npm";

      if (postDeps.length > 0 || postDevDeps.length > 0) {
        console.log(chalk.blue("\nAdding additional dependencies...\n"));
        addDependencies(projectDir, postDeps, false, packageManager);
        addDependencies(projectDir, postDevDeps, true, packageManager);
      }
    }

    // Add post-create scripts
    if (selectedPreset.postCreateScripts) {
      addScriptsToPackageJson(projectDir, selectedPreset.postCreateScripts);
    }

    // Delete unwanted files from create command
    if (selectedPreset.postCreateDelete) {
      deletePostCreateFiles(projectDir, selectedPreset.postCreateDelete);
    }

    // Copy post-create files (e.g., Drizzle config)
    if (selectedPreset.postCreateFiles) {
      console.log(chalk.blue("\nAdding additional files...\n"));
      copyPostCreateFiles(projectDir, selectedPreset.postCreateFiles, projectName);
    }
  } else if (isPython && selectedPreset) {
    // Flow 2: Python project (no create command)
    console.log(chalk.blue(`\nCreating project in ${chalk.bold(projectDir)}...\n`));
    ensureDir(projectDir);

    const requirementsTxt = generateRequirementsTxt(selectedPreset);
    writeFileSync(join(projectDir, "requirements.txt"), requirementsTxt);
    console.log(chalk.green(`  Created requirements.txt`));

    // Copy scaffold files
    if (selectedPreset.scaffoldFiles) {
      copyPostCreateFiles(projectDir, selectedPreset.scaffoldFiles, projectName);
    }

    if (!options.skipInstall) {
      installPythonDependencies(projectDir);
    }
  } else if (selectedPreset) {
    // Flow 3: Node project without create command (e.g., Fastify API)
    console.log(chalk.blue(`\nCreating project in ${chalk.bold(projectDir)}...\n`));
    ensureDir(projectDir);

    const packageJson = generatePackageJson(projectName, selectedPreset);
    writeFileSync(join(projectDir, "package.json"), JSON.stringify(packageJson, null, 2) + "\n");
    console.log(chalk.green(`  Created package.json`));

    // Copy scaffold files
    if (selectedPreset.scaffoldFiles) {
      copyPostCreateFiles(projectDir, selectedPreset.scaffoldFiles, projectName);
    }

    if (!options.skipInstall) {
      const packageManager = selectedPreset.packageManager ?? "npm";
      installNpmDependencies(projectDir, selectedPreset, packageManager);
    }
  }

  // Generate render.yaml Blueprint
  if (selectedPreset?.blueprint) {
    const renderYaml = generateRenderYaml(projectName, selectedPreset);
    writeFileSync(join(projectDir, "render.yaml"), renderYaml);
    console.log(chalk.green(`  Created render.yaml`));
  }

  // Copy config files and Cursor rules
  copyConfigFiles(projectDir, selectedRules, selectedConfigs, selectedExtras, projectName);

  // Initialize git (if not already done by create command)
  initGit(projectDir);

  // Done!
  console.log(chalk.green("\n✓ Project created successfully!\n"));
  console.log(chalk.white("Next steps:\n"));
  console.log(chalk.cyan(`  cd ${projectName}`));

  if (isPython) {
    console.log(chalk.cyan("  source .venv/bin/activate"));
    console.log(chalk.cyan("  uvicorn main:app --reload"));
  } else {
    if (options.skipInstall && !hasCreateCommand) {
      console.log(chalk.cyan("  npm install"));
    }
    console.log(chalk.cyan("  npm run dev"));
  }

  console.log();
}
