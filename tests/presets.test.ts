/**
 * Tests for preset-based scaffolding
 */

import { describe, it, beforeAll, afterAll } from "vitest";
import {
  cleanTestDir,
  scaffoldPreset,
  assertFileExists,
  assertFileNotExists,
  assertDirExists,
  assertDirNotExists,
  assertRenderYamlContains,
  assertCursorRulesExist,
  readProjectFile,
} from "./helpers";

describe("Preset Scaffolding", () => {
  beforeAll(() => {
    cleanTestDir();
  });

  afterAll(() => {
    cleanTestDir();
  });

  describe("next-fullstack preset", () => {
    const projectName = "test-next-fullstack";
    let projectDir: string;

    beforeAll(() => {
      projectDir = scaffoldPreset(projectName, "next-fullstack");
    });

    it("creates expected file structure", () => {
      assertFileExists(projectDir, "package.json");
      assertFileExists(projectDir, "render.yaml");
      assertFileExists(projectDir, "biome.json");
      assertFileExists(projectDir, "tsconfig.json");
      assertFileExists(projectDir, ".gitignore");
      assertFileExists(projectDir, ".env.example");
      
      // Drizzle files
      assertFileExists(projectDir, "drizzle.config.ts");
      assertFileExists(projectDir, "src/db/index.ts");
      assertFileExists(projectDir, "src/db/schema.ts");
      
      // Next.js files
      assertFileExists(projectDir, "src/app/layout.tsx");
      assertFileExists(projectDir, "src/app/page.tsx");
      assertFileExists(projectDir, "src/app/globals.css");
      assertFileExists(projectDir, "src/app/icon.png");
    });

    it("does NOT create GitHub templates", () => {
      assertDirNotExists(projectDir, ".github");
    });

    it("creates Cursor rules", () => {
      assertCursorRulesExist(projectDir, ["general", "typescript", "nextjs", "tailwind", "drizzle", "react"]);
    });

    it("creates correct render.yaml", () => {
      assertRenderYamlContains(projectDir, {
        hasProjects: true,
        serviceNames: [projectName],
        serviceTypes: ["web"],
        hasDatabase: true,
        databaseName: `${projectName}-db`,
      });
    });

    it("includes DATABASE_URL in render.yaml", () => {
      const yaml = readProjectFile(projectDir, "render.yaml");
      expect(yaml).toContain("DATABASE_URL");
      expect(yaml).toContain("fromDatabase:");
      expect(yaml).toContain("connectionString");
    });
  });

  describe("next-frontend preset", () => {
    const projectName = "test-next-frontend";
    let projectDir: string;

    beforeAll(() => {
      projectDir = scaffoldPreset(projectName, "next-frontend");
    });

    it("creates expected file structure", () => {
      assertFileExists(projectDir, "package.json");
      assertFileExists(projectDir, "render.yaml");
      assertFileExists(projectDir, "next.config.ts");
      assertFileExists(projectDir, "src/app/layout.tsx");
      assertFileExists(projectDir, "src/app/page.tsx");
    });

    it("does NOT create GitHub templates", () => {
      assertDirNotExists(projectDir, ".github");
    });

    it("creates Cursor rules", () => {
      assertCursorRulesExist(projectDir, ["general", "typescript", "nextjs", "tailwind", "react"]);
    });

    it("creates correct render.yaml for static site", () => {
      assertRenderYamlContains(projectDir, {
        hasProjects: false, // Single service, no projects wrapper
        serviceTypes: ["web"],
        hasDatabase: false,
      });
      
      const yaml = readProjectFile(projectDir, "render.yaml");
      expect(yaml).toContain("runtime: static");
      expect(yaml).toContain("staticPublishPath: out");
    });
  });

  describe("vite-spa preset", () => {
    const projectName = "test-vite-spa";
    let projectDir: string;

    beforeAll(() => {
      projectDir = scaffoldPreset(projectName, "vite-spa");
    });

    it("creates expected file structure", () => {
      assertFileExists(projectDir, "package.json");
      assertFileExists(projectDir, "render.yaml");
      assertFileExists(projectDir, "vite.config.ts");
      assertFileExists(projectDir, "src/index.css");
      assertFileExists(projectDir, "public/favicon.svg");
    });

    it("does NOT create GitHub templates", () => {
      assertDirNotExists(projectDir, ".github");
    });

    it("creates Cursor rules", () => {
      assertCursorRulesExist(projectDir, ["general", "typescript", "vite", "tailwind", "react"]);
    });

    it("creates correct render.yaml for static site", () => {
      const yaml = readProjectFile(projectDir, "render.yaml");
      expect(yaml).toContain("runtime: static");
      expect(yaml).toContain("staticPublishPath: dist");
    });
  });

  describe("fastify-api preset", () => {
    const projectName = "test-fastify-api";
    let projectDir: string;

    beforeAll(() => {
      projectDir = scaffoldPreset(projectName, "fastify-api");
    });

    it("creates expected file structure", () => {
      assertFileExists(projectDir, "package.json");
      assertFileExists(projectDir, "render.yaml");
      assertFileExists(projectDir, "tsconfig.json");
      assertFileExists(projectDir, "biome.json");
      assertFileExists(projectDir, "src/index.ts");
      assertFileExists(projectDir, "src/db/index.ts");
      assertFileExists(projectDir, "src/db/schema.ts");
      assertFileExists(projectDir, "drizzle.config.ts");
    });

    it("does NOT create GitHub templates", () => {
      assertDirNotExists(projectDir, ".github");
    });

    it("creates Cursor rules", () => {
      assertCursorRulesExist(projectDir, ["general", "typescript", "fastify", "drizzle"]);
    });

    it("creates correct render.yaml", () => {
      assertRenderYamlContains(projectDir, {
        hasProjects: true,
        serviceTypes: ["web"],
        hasDatabase: true,
        databaseName: `${projectName}-db`,
      });
      
      const yaml = readProjectFile(projectDir, "render.yaml");
      expect(yaml).toContain("runtime: node");
      expect(yaml).toContain("healthCheckPath: /health");
    });
  });

  describe("fastapi preset", () => {
    const projectName = "test-fastapi";
    let projectDir: string;

    beforeAll(() => {
      projectDir = scaffoldPreset(projectName, "fastapi");
    });

    it("creates expected file structure", () => {
      assertFileExists(projectDir, "requirements.txt");
      assertFileExists(projectDir, "render.yaml");
      assertFileExists(projectDir, "ruff.toml");
      assertFileExists(projectDir, "main.py");
      assertFileExists(projectDir, "app/__init__.py");
      assertFileExists(projectDir, "app/config.py");
      assertFileExists(projectDir, "app/database.py");
      assertFileExists(projectDir, "app/models.py");
    });

    it("does NOT create GitHub templates", () => {
      assertDirNotExists(projectDir, ".github");
    });

    it("creates Cursor rules", () => {
      assertCursorRulesExist(projectDir, ["general", "python", "sqlalchemy"]);
    });

    it("creates correct render.yaml", () => {
      assertRenderYamlContains(projectDir, {
        hasProjects: true,
        serviceTypes: ["web"],
        hasDatabase: true,
      });
      
      const yaml = readProjectFile(projectDir, "render.yaml");
      expect(yaml).toContain("runtime: python");
      expect(yaml).toContain("uvicorn main:app");
    });

    it("includes Python dependencies in requirements.txt", () => {
      const requirements = readProjectFile(projectDir, "requirements.txt");
      expect(requirements).toContain("fastapi");
      expect(requirements).toContain("uvicorn");
      expect(requirements).toContain("sqlalchemy");
      expect(requirements).toContain("pydantic");
    });
  });

  describe("multi-api preset", () => {
    const projectName = "test-multi-api";
    let projectDir: string;

    beforeAll(() => {
      projectDir = scaffoldPreset(projectName, "multi-api");
    });

    it("creates expected monorepo structure", () => {
      assertFileExists(projectDir, "README.md");
      assertFileExists(projectDir, ".gitignore");
      assertFileExists(projectDir, "render.yaml");
      
      // Node API (simple, no database)
      assertDirExists(projectDir, "node-api");
      assertFileExists(projectDir, "node-api/package.json");
      assertFileExists(projectDir, "node-api/tsconfig.json");
      assertFileExists(projectDir, "node-api/src/index.ts");
      
      // Python API (simple, no database)
      assertDirExists(projectDir, "python-api");
      assertFileExists(projectDir, "python-api/requirements.txt");
      assertFileExists(projectDir, "python-api/main.py");
    });

    it("does NOT create GitHub templates", () => {
      assertDirNotExists(projectDir, ".github");
    });

    it("creates Cursor rules for both languages", () => {
      assertCursorRulesExist(projectDir, ["general", "typescript", "fastify", "python"]);
    });

    it("creates correct render.yaml with multiple services (no database)", () => {
      assertRenderYamlContains(projectDir, {
        hasProjects: true,
        serviceNames: ["node-api", "python-api"],
        hasDatabase: false,
      });
      
      const yaml = readProjectFile(projectDir, "render.yaml");
      expect(yaml).toContain("rootDir: node-api");
      expect(yaml).toContain("rootDir: python-api");
    });
  });
});
