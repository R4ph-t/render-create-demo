/**
 * Test helpers for CLI testing
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { expect } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CLI_PATH = resolve(__dirname, "../dist/cli.js");
const TEST_DIR = resolve(__dirname, "../.test-output");

/**
 * Clean up test output directory
 */
export function cleanTestDir(): void {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

/**
 * Get the path for a test project
 */
export function getTestProjectPath(name: string): string {
  return join(TEST_DIR, name);
}

/**
 * Scaffold a project using a preset
 */
export function scaffoldPreset(projectName: string, preset: string): string {
  const projectPath = getTestProjectPath(projectName);
  
  // Clean up if exists
  if (existsSync(projectPath)) {
    rmSync(projectPath, { recursive: true, force: true });
  }
  
  // Ensure parent directory exists
  execSync(`mkdir -p "${TEST_DIR}"`, { stdio: "pipe" });
  
  // Run the CLI with inherited stdio for debugging
  try {
    execSync(
      `node "${CLI_PATH}" init "${projectName}" -p "${preset}" -y --skip-install`,
      { cwd: TEST_DIR, stdio: "inherit" }
    );
  } catch (error) {
    console.error(`Failed to scaffold preset ${preset} for ${projectName}:`, error);
    throw error;
  }
  
  return projectPath;
}

/**
 * Scaffold a composable project by simulating selections
 * This creates the project programmatically by importing the init function
 */
export async function scaffoldComposable(
  projectName: string,
  options: {
    frontend?: string | null;
    frontendDeployType?: "static" | "webservice" | null;
    apis?: string[];
    workers?: string[];
    database?: string | null;
    cache?: string | null;
  }
): Promise<string> {
  const projectPath = getTestProjectPath(projectName);
  
  // We need to use the internal function for composable scaffolding
  // For now, we'll import and call it directly
  const { scaffoldComposableProject } = await import("../dist/commands/init.js");
  const { loadPresets } = await import("../dist/utils.js");
  
  const presetsConfig = loadPresets();
  const components = presetsConfig.components!;
  
  // Ensure parent directory exists
  execSync(`mkdir -p "${TEST_DIR}"`, { stdio: "pipe" });
  
  // Change to test dir and scaffold
  const originalCwd = process.cwd();
  process.chdir(TEST_DIR);
  
  // Determine deploy type: if frontend is specified and deploy type is not,
  // default to "static" for backwards compatibility
  let frontendDeployType = options.frontendDeployType ?? null;
  if (options.frontend && !frontendDeployType) {
    frontendDeployType = "static";
  }
  
  try {
    await scaffoldComposableProject(
      {
        projectName,
        frontend: options.frontend ?? null,
        frontendDeployType,
        apis: options.apis ?? [],
        workers: options.workers ?? [],
        database: options.database ?? null,
        cache: options.cache ?? null,
        extras: ["env"],
      },
      components,
      true // skipInstall
    );
  } finally {
    process.chdir(originalCwd);
  }
  
  return projectPath;
}

// ============================================================================
// Assertions
// ============================================================================

/**
 * Assert a file exists
 */
export function assertFileExists(projectDir: string, relativePath: string): void {
  const fullPath = join(projectDir, relativePath);
  expect(existsSync(fullPath), `File should exist: ${relativePath}`).toBe(true);
}

/**
 * Assert a file does NOT exist
 */
export function assertFileNotExists(projectDir: string, relativePath: string): void {
  const fullPath = join(projectDir, relativePath);
  expect(existsSync(fullPath), `File should NOT exist: ${relativePath}`).toBe(false);
}

/**
 * Assert a directory exists
 */
export function assertDirExists(projectDir: string, relativePath: string): void {
  const fullPath = join(projectDir, relativePath);
  expect(existsSync(fullPath), `Directory should exist: ${relativePath}`).toBe(true);
  expect(statSync(fullPath).isDirectory(), `Should be a directory: ${relativePath}`).toBe(true);
}

/**
 * Assert a directory does NOT exist
 */
export function assertDirNotExists(projectDir: string, relativePath: string): void {
  const fullPath = join(projectDir, relativePath);
  expect(existsSync(fullPath), `Directory should NOT exist: ${relativePath}`).toBe(false);
}

/**
 * Read a file from project
 */
export function readProjectFile(projectDir: string, relativePath: string): string {
  const fullPath = join(projectDir, relativePath);
  return readFileSync(fullPath, "utf-8");
}

/**
 * Read and parse JSON file from project
 */
export function readProjectJson(projectDir: string, relativePath: string): unknown {
  const content = readProjectFile(projectDir, relativePath);
  return JSON.parse(content);
}

/**
 * Assert render.yaml contains expected content
 */
export function assertRenderYamlContains(
  projectDir: string,
  checks: {
    hasProjects?: boolean;
    serviceNames?: string[];
    serviceTypes?: string[];
    hasDatabase?: boolean;
    databaseName?: string;
    hasKeyValue?: boolean;
    keyValueName?: string;
  }
): void {
  const yaml = readProjectFile(projectDir, "render.yaml");
  
  if (checks.hasProjects !== undefined) {
    if (checks.hasProjects) {
      expect(yaml).toContain("projects:");
      expect(yaml).toContain("environments:");
    } else {
      expect(yaml).not.toContain("projects:");
    }
  }
  
  if (checks.serviceNames) {
    for (const name of checks.serviceNames) {
      expect(yaml).toContain(`name: ${name}`);
    }
  }
  
  if (checks.serviceTypes) {
    for (const type of checks.serviceTypes) {
      expect(yaml).toContain(`type: ${type}`);
    }
  }
  
  if (checks.hasDatabase !== undefined) {
    if (checks.hasDatabase) {
      expect(yaml).toContain("databases:");
    } else {
      expect(yaml).not.toContain("databases:");
    }
  }
  
  if (checks.databaseName) {
    expect(yaml).toContain(`name: ${checks.databaseName}`);
  }
  
  if (checks.hasKeyValue !== undefined) {
    if (checks.hasKeyValue) {
      expect(yaml).toContain("keyValues:");
    } else {
      expect(yaml).not.toContain("keyValues:");
    }
  }
  
  if (checks.keyValueName) {
    expect(yaml).toContain(`name: ${checks.keyValueName}`);
  }
}

/**
 * Assert package.json has expected dependencies
 */
export function assertPackageJsonHasDeps(
  projectDir: string,
  deps: string[],
  dev = false
): void {
  const pkg = readProjectJson(projectDir, "package.json") as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  
  const depsObj = dev ? pkg.devDependencies : pkg.dependencies;
  
  for (const dep of deps) {
    expect(depsObj, `Should have ${dev ? "dev " : ""}dependency: ${dep}`).toHaveProperty(dep);
  }
}

/**
 * Assert Cursor rules exist
 */
export function assertCursorRulesExist(projectDir: string, rules: string[]): void {
  assertDirExists(projectDir, ".cursor/rules");
  
  for (const rule of rules) {
    assertFileExists(projectDir, `.cursor/rules/${rule}.mdc`);
  }
}

/**
 * List all files in a directory recursively
 */
export function listFilesRecursive(dir: string, prefix = ""): string[] {
  const files: string[] = [];
  
  if (!existsSync(dir)) {
    return files;
  }
  
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const relativePath = prefix ? `${prefix}/${entry}` : entry;
    
    if (statSync(fullPath).isDirectory()) {
      if (entry !== "node_modules" && entry !== ".git" && entry !== ".venv") {
        files.push(...listFilesRecursive(fullPath, relativePath));
      }
    } else {
      files.push(relativePath);
    }
  }
  
  return files;
}
