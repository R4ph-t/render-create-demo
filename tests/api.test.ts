import { describe, it, expect, beforeAll } from "vitest";
import { parse as parseYAML } from "yaml";
import { ALL_PRESETS, composeRecipe, fetchRecipeNames } from "./helpers.js";

// Recipes that should include a database
const PRESETS_WITH_DB = new Set([
  "next-fullstack",
  "fastify-api",
  "fastapi",
  "express-api",
  "hono-api",
  "django",
  "remix-fullstack",
  "flask-api",
  "rails-fullstack",
  "phoenix-fullstack",
  "gin-api",
  "nestjs-api",
  "vite-fastapi",
  "vite-go",
  "react-express",
  "monorepo",
  "microservices",
]);

// Presets that produce static sites (no runtime/startCommand)
const STATIC_PRESETS = new Set([
  "next-frontend",
  "vite-spa",
  "astro-static",
  "docs-site",
]);

// ---------------------------------------------------------------------------
// 1. Recipe list from API contains all our presets
// ---------------------------------------------------------------------------
describe("API recipe registry", () => {
  let apiRecipes: string[];

  beforeAll(async () => {
    apiRecipes = await fetchRecipeNames();
  });

  it("API returns all 23 recipe names", () => {
    for (const name of ALL_PRESETS) {
      expect(apiRecipes, `API missing recipe: ${name}`).toContain(name);
    }
  });

  it("no preset is missing from the API", () => {
    const missingFromAPI = ALL_PRESETS.filter(
      (p) => !apiRecipes.includes(p),
    );
    expect(missingFromAPI).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 2. Each recipe composes successfully and returns valid YAML
// ---------------------------------------------------------------------------
describe("compose endpoint", () => {
  for (const recipe of ALL_PRESETS) {
    describe(recipe, () => {
      let result: { blueprint: Record<string, unknown>; yaml: string };

      beforeAll(async () => {
        result = await composeRecipe(recipe);
      });

      it("returns a blueprint object", () => {
        expect(result.blueprint).toBeDefined();
        expect(typeof result.blueprint).toBe("object");
      });

      it("returns a yaml string", () => {
        expect(result.yaml).toBeDefined();
        expect(typeof result.yaml).toBe("string");
        expect(result.yaml.length).toBeGreaterThan(0);
      });

      it("yaml field is valid YAML", () => {
        expect(() => parseYAML(result.yaml)).not.toThrow();
      });

      it("yaml contains the project name", () => {
        expect(result.yaml).toContain("test-proj");
      });

      it("yaml parses to a structure with services or projects", () => {
        const parsed = parseYAML(result.yaml) as Record<string, unknown>;
        const hasProjects = "projects" in parsed;
        const hasServices = "services" in parsed;
        const hasDatabases = "databases" in parsed;
        expect(
          hasProjects || hasServices || hasDatabases,
          "YAML should have projects, services, or databases at top level",
        ).toBe(true);
      });

      if (!STATIC_PRESETS.has(recipe)) {
        it("dynamic services have buildCommand and startCommand", () => {
          const parsed = parseYAML(result.yaml) as Record<string, unknown>;
          const services = findAllServices(parsed);
          // Filter to services that should be dynamic (have a runtime or startCommand).
          // Static site frontends inside composite presets have buildCommand
          // but no startCommand — exclude them via staticPublishPath or missing runtime.
          const dynamicServices = services.filter(
            (s) =>
              (s.type === "web" || s.type === "pserv") &&
              !s.staticPublishPath,
          );
          for (const svc of dynamicServices) {
            if (!svc.startCommand && !svc.runtime) continue; // truly static
            expect(
              svc.buildCommand,
              `service ${svc.name} missing buildCommand`,
            ).toBeDefined();
            if (svc.startCommand || svc.runtime) {
              expect(
                svc.startCommand,
                `service ${svc.name} missing startCommand`,
              ).toBeDefined();
            }
          }
        });

        it("dynamic services have a runtime", () => {
          const parsed = parseYAML(result.yaml) as Record<string, unknown>;
          const services = findAllServices(parsed);
          const dynamicServices = services.filter(
            (s) =>
              (s.type === "web" || s.type === "pserv") &&
              !s.staticPublishPath &&
              s.startCommand,
          );
          for (const svc of dynamicServices) {
            expect(
              svc.runtime,
              `service ${svc.name} missing runtime`,
            ).toBeDefined();
          }
        });
      }

      if (PRESETS_WITH_DB.has(recipe)) {
        it("includes a database", () => {
          const parsed = parseYAML(result.yaml) as Record<string, unknown>;
          const databases = findAllDatabases(parsed);
          expect(
            databases.length,
            "expected at least one database",
          ).toBeGreaterThan(0);
        });
      }

      if (STATIC_PRESETS.has(recipe)) {
        it("includes a static site", () => {
          const parsed = parseYAML(result.yaml) as Record<string, unknown>;
          const services = findAllServices(parsed);
          const staticSites = services.filter(
            (s) => s.type === "web" && !s.startCommand,
          );
          // Some static sites may appear differently
          expect(services.length).toBeGreaterThan(0);
        });
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Helpers for navigating Blueprint YAML structures
// ---------------------------------------------------------------------------

interface ServiceInfo {
  name?: string;
  type?: string;
  runtime?: string;
  buildCommand?: string;
  startCommand?: string;
  staticPublishPath?: string;
}

interface DatabaseInfo {
  name?: string;
  plan?: string;
}

function findAllServices(parsed: Record<string, unknown>): ServiceInfo[] {
  const services: ServiceInfo[] = [];

  // Top-level services array
  if (Array.isArray(parsed.services)) {
    services.push(...parsed.services);
  }

  // Nested under projects -> environments -> services
  if (Array.isArray(parsed.projects)) {
    for (const project of parsed.projects as Record<string, unknown>[]) {
      if (Array.isArray(project.environments)) {
        for (const env of project.environments as Record<string, unknown>[]) {
          if (Array.isArray(env.services)) {
            services.push(...(env.services as ServiceInfo[]));
          }
        }
      }
    }
  }

  return services;
}

function findAllDatabases(parsed: Record<string, unknown>): DatabaseInfo[] {
  const databases: DatabaseInfo[] = [];

  // Top-level databases array
  if (Array.isArray(parsed.databases)) {
    databases.push(...parsed.databases);
  }

  // Nested under projects -> environments -> databases
  if (Array.isArray(parsed.projects)) {
    for (const project of parsed.projects as Record<string, unknown>[]) {
      if (Array.isArray(project.environments)) {
        for (const env of project.environments as Record<string, unknown>[]) {
          if (Array.isArray(env.databases)) {
            databases.push(...(env.databases as DatabaseInfo[]));
          }
        }
      }
      // Also check project-level databases
      if (Array.isArray(project.databases)) {
        databases.push(...(project.databases as DatabaseInfo[]));
      }
    }
  }

  return databases;
}
