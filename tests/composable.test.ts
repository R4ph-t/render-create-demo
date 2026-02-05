/**
 * Tests for composable flow scaffolding
 */

import { describe, it, beforeAll, afterAll } from "vitest";
import {
  cleanTestDir,
  cleanProject,
  scaffoldComposable,
  assertFileExists,
  assertDirExists,
  assertDirNotExists,
  assertRenderYamlContains,
  assertCursorRulesExist,
  readProjectFile,
} from "./helpers";

describe("Composable Flow Scaffolding", () => {
  beforeAll(() => {
    cleanTestDir();
  });

  afterAll(() => {
    cleanTestDir();
  });

  describe("Frontend only - Next.js (static)", () => {
    const projectName = "comp-nextjs-static";
    let projectDir: string;

    beforeAll(async () => {
      projectDir = await scaffoldComposable(projectName, {
        frontend: "nextjs",
        frontendDeployType: "static",
      });
    });

    it("creates frontend directory", () => {
      assertDirExists(projectDir, "frontend");
      assertFileExists(projectDir, "frontend/package.json");
    });

    it("creates root files", () => {
      assertFileExists(projectDir, "README.md");
      assertFileExists(projectDir, ".gitignore");
      assertFileExists(projectDir, "render.yaml");
      assertFileExists(projectDir, ".env.example");
    });

    it("does NOT create api directories", () => {
      assertDirNotExists(projectDir, "node-api");
      assertDirNotExists(projectDir, "python-api");
    });

    it("creates static site render.yaml", () => {
      assertRenderYamlContains(projectDir, {
        hasProjects: true,
        serviceNames: [`${projectName}-frontend`],
        serviceTypes: ["web"],
        hasDatabase: false,
      });
      
      const yaml = readProjectFile(projectDir, "render.yaml");
      expect(yaml).toContain("runtime: static");
      expect(yaml).toContain("staticPublishPath: out");
      expect(yaml).not.toContain("startCommand:");
    });

    it("creates next.config.ts for static export", () => {
      assertFileExists(projectDir, "frontend/next.config.ts");
      const config = readProjectFile(projectDir, "frontend/next.config.ts");
      expect(config).toContain('output: "export"');
      expect(config).toContain("unoptimized: true");
    });

    it("creates Cursor rules for frontend", () => {
      assertCursorRulesExist(projectDir, ["general", "typescript", "nextjs", "tailwind", "react"]);
    });
  });

  describe("Frontend only - Next.js (webservice)", () => {
    const projectName = "comp-nextjs-webservice";
    let projectDir: string;

    beforeAll(async () => {
      projectDir = await scaffoldComposable(projectName, {
        frontend: "nextjs",
        frontendDeployType: "webservice",
      });
    });

    it("creates frontend directory", () => {
      assertDirExists(projectDir, "frontend");
      assertFileExists(projectDir, "frontend/package.json");
    });

    it("creates webservice render.yaml with node runtime", () => {
      assertRenderYamlContains(projectDir, {
        hasProjects: true,
        serviceNames: [`${projectName}-frontend`],
        serviceTypes: ["web"],
        hasDatabase: false,
      });
      
      const yaml = readProjectFile(projectDir, "render.yaml");
      expect(yaml).toContain("runtime: node");
      expect(yaml).toContain("startCommand: npm start");
      expect(yaml).toContain("healthCheckPath: /");
      expect(yaml).not.toContain("staticPublishPath:");
    });

    it("does NOT create static export config", () => {
      // The default next.config.ts from create-next-app should NOT have output: "export"
      const config = readProjectFile(projectDir, "frontend/next.config.ts");
      expect(config).not.toContain('output: "export"');
    });

    it("creates Cursor rules for frontend", () => {
      assertCursorRulesExist(projectDir, ["general", "typescript", "nextjs", "tailwind", "react"]);
    });
  });

  describe("Frontend only - Vite (static only)", () => {
    const projectName = "comp-vite-only";
    let projectDir: string;

    beforeAll(async () => {
      projectDir = await scaffoldComposable(projectName, {
        frontend: "vite",
        // Vite only supports static deploy, so this is the only option
        frontendDeployType: "static",
      });
    });

    it("creates frontend directory", () => {
      assertDirExists(projectDir, "frontend");
      assertFileExists(projectDir, "frontend/package.json");
    });

    it("creates static site render.yaml", () => {
      assertRenderYamlContains(projectDir, {
        hasProjects: true,
        serviceNames: [`${projectName}-frontend`],
        hasDatabase: false,
      });

      const yaml = readProjectFile(projectDir, "render.yaml");
      expect(yaml).toContain("runtime: static");
      expect(yaml).toContain("staticPublishPath: dist");
      expect(yaml).not.toContain("startCommand:");
    });
  });

  describe("API only - Fastify", () => {
    const projectName = "comp-fastify-only";
    let projectDir: string;

    beforeAll(async () => {
      projectDir = await scaffoldComposable(projectName, {
        apis: ["fastify"],
      });
    });

    it("creates node-api directory", () => {
      assertDirExists(projectDir, "node-api");
      assertFileExists(projectDir, "node-api/package.json");
      assertFileExists(projectDir, "node-api/src/index.ts");
    });

    it("creates root config files", () => {
      assertFileExists(projectDir, "biome.json");
      assertFileExists(projectDir, ".gitignore");
    });

    it("does NOT create frontend", () => {
      assertDirNotExists(projectDir, "frontend");
    });

    it("creates correct render.yaml", () => {
      assertRenderYamlContains(projectDir, {
        hasProjects: true,
        serviceNames: [`${projectName}-node-api`],
        serviceTypes: ["web"],
        hasDatabase: false,
      });

      const yaml = readProjectFile(projectDir, "render.yaml");
      expect(yaml).toContain("runtime: node");
      expect(yaml).toContain("rootDir: node-api");
    });
  });

  describe("API only - FastAPI", () => {
    const projectName = "comp-fastapi-only";
    let projectDir: string;

    beforeAll(async () => {
      projectDir = await scaffoldComposable(projectName, {
        apis: ["fastapi"],
      });
    });

    it("creates python-api directory", () => {
      assertDirExists(projectDir, "python-api");
      assertFileExists(projectDir, "python-api/requirements.txt");
      assertFileExists(projectDir, "python-api/main.py");
    });

    it("creates root config files", () => {
      assertFileExists(projectDir, "ruff.toml");
      assertFileExists(projectDir, ".gitignore");
    });

    it("creates correct render.yaml", () => {
      assertRenderYamlContains(projectDir, {
        hasProjects: true,
        serviceNames: [`${projectName}-python-api`],
        hasDatabase: false,
      });

      const yaml = readProjectFile(projectDir, "render.yaml");
      expect(yaml).toContain("runtime: python");
      expect(yaml).toContain("rootDir: python-api");
    });
  });

  describe("Multiple APIs - Fastify + FastAPI", () => {
    const projectName = "comp-multi-api";
    let projectDir: string;

    beforeAll(async () => {
      projectDir = await scaffoldComposable(projectName, {
        apis: ["fastify", "fastapi"],
      });
    });

    it("creates both API directories", () => {
      assertDirExists(projectDir, "node-api");
      assertDirExists(projectDir, "python-api");
    });

    it("creates correct render.yaml with both services", () => {
      assertRenderYamlContains(projectDir, {
        hasProjects: true,
        serviceNames: [`${projectName}-node-api`, `${projectName}-python-api`],
      });
    });

    it("creates Cursor rules for both languages (no ORM rules without database)", () => {
      assertCursorRulesExist(projectDir, ["general", "typescript", "fastify", "python"]);
    });
  });

  describe("API with Database", () => {
    const projectName = "comp-api-db";
    let projectDir: string;

    beforeAll(async () => {
      projectDir = await scaffoldComposable(projectName, {
        apis: ["fastify"],
        database: "postgres",
      });
    });

    it("creates render.yaml with database", () => {
      assertRenderYamlContains(projectDir, {
        hasProjects: true,
        hasDatabase: true,
        databaseName: `${projectName}-db`,
      });
    });

    it("includes DATABASE_URL env var for API", () => {
      const yaml = readProjectFile(projectDir, "render.yaml");
      expect(yaml).toContain("DATABASE_URL");
      expect(yaml).toContain("fromDatabase:");
      expect(yaml).toContain("connectionString");
    });

    it("includes ORM rules when database is selected", () => {
      assertCursorRulesExist(projectDir, ["general", "typescript", "fastify", "drizzle"]);
    });
  });

  describe("API with Cache", () => {
    const projectName = "comp-api-cache";
    let projectDir: string;

    beforeAll(async () => {
      projectDir = await scaffoldComposable(projectName, {
        apis: ["fastify"],
        cache: "redis",
      });
    });

    it("creates render.yaml with keyValues", () => {
      assertRenderYamlContains(projectDir, {
        hasProjects: true,
        hasKeyValue: true,
        keyValueName: `${projectName}-cache`,
      });
    });
  });

  describe("Worker - Background (TypeScript)", () => {
    const projectName = "comp-worker-ts";
    let projectDir: string;

    beforeAll(async () => {
      projectDir = await scaffoldComposable(projectName, {
        workers: ["worker-ts"],
      });
    });

    it("creates worker directory", () => {
      assertDirExists(projectDir, "worker-ts");
      assertFileExists(projectDir, "worker-ts/package.json");
      assertFileExists(projectDir, "worker-ts/src/worker.ts");
    });

    it("creates render.yaml with worker service", () => {
      const yaml = readProjectFile(projectDir, "render.yaml");
      expect(yaml).toContain("type: worker");
      expect(yaml).toContain("rootDir: worker-ts");
    });
  });

  describe("Worker - Background (Python)", () => {
    const projectName = "comp-worker-py";
    let projectDir: string;

    beforeAll(async () => {
      projectDir = await scaffoldComposable(projectName, {
        workers: ["worker-py"],
      });
    });

    it("creates worker directory", () => {
      assertDirExists(projectDir, "worker-py");
      assertFileExists(projectDir, "worker-py/requirements.txt");
      assertFileExists(projectDir, "worker-py/worker.py");
    });

    it("creates render.yaml with worker service", () => {
      const yaml = readProjectFile(projectDir, "render.yaml");
      expect(yaml).toContain("type: worker");
      expect(yaml).toContain("runtime: python");
    });
  });

  describe("Cron Job (TypeScript)", () => {
    const projectName = "comp-cron-ts";
    let projectDir: string;

    beforeAll(async () => {
      projectDir = await scaffoldComposable(projectName, {
        workers: ["cron-ts"],
      });
    });

    it("creates cron directory", () => {
      assertDirExists(projectDir, "cron-ts");
      assertFileExists(projectDir, "cron-ts/package.json");
      assertFileExists(projectDir, "cron-ts/src/cron.ts");
    });

    it("creates render.yaml with cron service", () => {
      const yaml = readProjectFile(projectDir, "render.yaml");
      expect(yaml).toContain("type: cron");
      expect(yaml).toContain("schedule:");
    });
  });

  describe("Workflow (TypeScript) - No Blueprint", () => {
    const projectName = "comp-workflow-ts";
    let projectDir: string;

    beforeAll(async () => {
      projectDir = await scaffoldComposable(projectName, {
        workers: ["workflow-ts"],
      });
    });

    it("creates workflow directory", () => {
      assertDirExists(projectDir, "workflow-ts");
      assertFileExists(projectDir, "workflow-ts/package.json");
      assertFileExists(projectDir, "workflow-ts/src/workflow.ts");
    });

    it("does NOT include workflow service in render.yaml (not supported)", () => {
      const yaml = readProjectFile(projectDir, "render.yaml");
      // Workflows should not appear as a service since they're not blueprint-supported
      // The yaml might contain workflow-ts in the project name, but should NOT have it as a service rootDir
      expect(yaml).not.toContain("rootDir: workflow-ts");
      expect(yaml).not.toContain(`name: ${projectName}-workflow-ts`);
    });
  });

  describe("Full Stack - Frontend + API + Worker + Database + Cache", () => {
    const projectName = "comp-fullstack";
    let projectDir: string;

    beforeAll(async () => {
      projectDir = await scaffoldComposable(projectName, {
        frontend: "nextjs",
        frontendDeployType: "webservice", // Use webservice for full-stack apps
        apis: ["fastify", "fastapi"],
        workers: ["worker-ts", "cron-py"],
        database: "postgres",
        cache: "redis",
      });
    });

    it("creates all expected directories", () => {
      assertDirExists(projectDir, "frontend");
      assertDirExists(projectDir, "node-api");
      assertDirExists(projectDir, "python-api");
      assertDirExists(projectDir, "worker-ts");
      assertDirExists(projectDir, "cron-py");
    });

    it("creates comprehensive render.yaml", () => {
      assertRenderYamlContains(projectDir, {
        hasProjects: true,
        serviceNames: [
          `${projectName}-frontend`,
          `${projectName}-node-api`,
          `${projectName}-python-api`,
        ],
        hasDatabase: true,
        hasKeyValue: true,
      });
    });

    it("includes worker and cron services", () => {
      const yaml = readProjectFile(projectDir, "render.yaml");
      expect(yaml).toContain("type: worker");
      expect(yaml).toContain("type: cron");
    });

    it("wires DATABASE_URL to all services that need it", () => {
      const yaml = readProjectFile(projectDir, "render.yaml");
      // Should appear multiple times for different services
      const dbUrlMatches = yaml.match(/DATABASE_URL/g);
      expect(dbUrlMatches?.length).toBeGreaterThanOrEqual(2);
    });

    it("creates Cursor rules for all technologies", () => {
      assertCursorRulesExist(projectDir, [
        "general",
        "typescript",
        "nextjs",
        "tailwind",
        "react",
        "fastify",
        "drizzle",
        "python",
        "sqlalchemy",
      ]);
    });
  });
});
