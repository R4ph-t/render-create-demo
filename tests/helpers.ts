import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const SKILL_DIR = resolve(__dirname, "..", "skill");
export const TEMPLATES_DIR = resolve(SKILL_DIR, "templates");
export const REFERENCES_DIR = resolve(SKILL_DIR, "references");
export const FRAGMENTS_API = "https://render-fragments.onrender.com";

/** All 23 preset names, in the order they appear in presets.md */
export const ALL_PRESETS = [
  "next-fullstack",
  "next-frontend",
  "vite-spa",
  "fastify-api",
  "fastapi",
  "express-api",
  "hono-api",
  "django",
  "remix-fullstack",
  "astro-static",
  "sveltekit-fullstack",
  "flask-api",
  "rails-fullstack",
  "phoenix-fullstack",
  "gin-api",
  "nestjs-api",
  "nuxt-fullstack",
  "docs-site",
  "vite-fastapi",
  "vite-go",
  "react-express",
  "monorepo",
  "microservices",
] as const;

export type PresetName = (typeof ALL_PRESETS)[number];

export interface TemplateCopy {
  source: string; // relative path inside templates/
  destination: string; // relative path inside the output project
}

export interface PresetInfo {
  name: string;
  recipe: string;
  templateCopies: TemplateCopy[];
  configCopies: TemplateCopy[];
  cursorRules: string[];
  isComposite: boolean;
}

/**
 * Parse presets.md and extract structured info for each preset.
 */
export function parsePresets(): PresetInfo[] {
  const content = readFileSync(
    resolve(REFERENCES_DIR, "presets.md"),
    "utf-8",
  );
  const sections = content.split(/\n---\n/);
  const presets: PresetInfo[] = [];

  for (const section of sections) {
    const headerMatch = section.match(/^## ([a-z0-9-]+)/m);
    if (!headerMatch) continue;

    const name = headerMatch[1];

    // Extract recipe from the curl command
    const recipeMatch = section.match(/"recipe":\s*"([^"]+)"/);
    const recipe = recipeMatch ? recipeMatch[1] : name;

    // Check if composite
    const isComposite =
      section.includes("composite preset") ||
      section.includes("component steps from");

    // Extract template copy tables (Source/Destination markdown tables)
    const templateCopies: TemplateCopy[] = [];
    const configCopies: TemplateCopy[] = [];

    // Find all markdown tables with Source/Destination columns
    const tableRegex =
      /### \d+\. (Copy template files|Copy config files)[^\n]*\n\n\|[^\n]+\|\n\|[-| ]+\|\n((?:\|[^\n]+\|\n)*)/g;
    let tableMatch: RegExpExecArray | null;
    while ((tableMatch = tableRegex.exec(section)) !== null) {
      const isConfig = tableMatch[1].includes("config");
      const rows = tableMatch[2].trim().split("\n");
      for (const row of rows) {
        const cellMatch = row.match(
          /\|\s*`([^`]+)`\s*\|\s*`([^`]+)`[^|]*\|/,
        );
        if (cellMatch) {
          const copy: TemplateCopy = {
            source: cellMatch[1],
            destination: cellMatch[2],
          };
          if (isConfig) {
            configCopies.push(copy);
          } else {
            templateCopies.push(copy);
          }
        }
      }
    }

    // Also handle tables not preceded by the exact header (broader match)
    const allTableRegex =
      /\| Source \(in templates\/\) \| Destination \(in project\) \|\n\|[-| ]+\|\n((?:\|[^\n]+\|\n)*)/g;
    const allCopies: TemplateCopy[] = [];
    let allMatch: RegExpExecArray | null;
    while ((allMatch = allTableRegex.exec(section)) !== null) {
      const rows = allMatch[1].trim().split("\n");
      for (const row of rows) {
        const cellMatch = row.match(
          /\|\s*`([^`]+)`\s*\|\s*`([^`]+)`[^|]*\|/,
        );
        if (cellMatch) {
          allCopies.push({
            source: cellMatch[1],
            destination: cellMatch[2],
          });
        }
      }
    }

    // Deduplicate: allCopies is the superset
    const existingSources = new Set([
      ...templateCopies.map((c) => c.source),
      ...configCopies.map((c) => c.source),
    ]);
    for (const copy of allCopies) {
      if (!existingSources.has(copy.source)) {
        templateCopies.push(copy);
      }
    }

    // Extract cursor rules from "Rules: `rule1`, `rule2`, ..." line
    const rulesMatch = section.match(/Rules:\s*(.+)/);
    const cursorRules: string[] = [];
    if (rulesMatch) {
      const ruleNames = rulesMatch[1].match(/`([^`]+)`/g);
      if (ruleNames) {
        for (const r of ruleNames) {
          cursorRules.push(r.replace(/`/g, ""));
        }
      }
    }

    presets.push({
      name,
      recipe,
      templateCopies,
      configCopies,
      cursorRules,
      isComposite,
    });
  }

  return presets;
}

/**
 * Parse cursor-rules.md to get rules-by-stack and rules-per-preset tables.
 */
export function parseCursorRulesDoc(): {
  ruleFiles: string[];
  presetRules: Record<string, string[]>;
} {
  const content = readFileSync(
    resolve(REFERENCES_DIR, "cursor-rules.md"),
    "utf-8",
  );

  // Extract rule files from "Rules by stack" table
  const ruleFiles: string[] = [];
  const ruleFileRegex = /\|\s*`([^`]+\.mdc)`\s*\|/g;
  let m: RegExpExecArray | null;
  while ((m = ruleFileRegex.exec(content)) !== null) {
    if (!ruleFiles.includes(m[1])) {
      ruleFiles.push(m[1]);
    }
  }

  // Extract preset rules from "Rules per preset" table
  const presetRules: Record<string, string[]> = {};
  const presetTableRegex =
    /\|\s*`([^`]+)`\s*\|\s*((?:[a-z]+(?:,\s*)?)+)\s*\|/g;
  // Find the "Rules per preset" section
  const presetSection = content.split("## Rules per preset")[1] || "";
  let pm: RegExpExecArray | null;
  while ((pm = presetTableRegex.exec(presetSection)) !== null) {
    const presetName = pm[1];
    const rules = pm[2].split(",").map((r) => r.trim());
    presetRules[presetName] = rules;
  }

  return { ruleFiles, presetRules };
}

/**
 * Check if a template file exists.
 */
export function templateExists(relativePath: string): boolean {
  return existsSync(resolve(TEMPLATES_DIR, relativePath));
}

/**
 * Read a template file contents with optional PROJECT_NAME substitution.
 */
export function readTemplate(
  relativePath: string,
  projectName = "test-project",
): string {
  const content = readFileSync(
    resolve(TEMPLATES_DIR, relativePath),
    "utf-8",
  );
  return content.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
}

/**
 * Call the Fragments API compose endpoint.
 */
export async function composeRecipe(
  recipe: string,
  projectName = "test-proj",
): Promise<{ blueprint: Record<string, unknown>; yaml: string }> {
  const res = await fetch(`${FRAGMENTS_API}/v1/compose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectName, recipe }),
  });
  if (!res.ok) {
    throw new Error(
      `Compose failed for recipe "${recipe}": ${res.status} ${await res.text()}`,
    );
  }
  return res.json();
}

/**
 * Fetch all recipe names from the API.
 */
export async function fetchRecipeNames(): Promise<string[]> {
  const res = await fetch(`${FRAGMENTS_API}/v1/recipes`);
  if (!res.ok) {
    throw new Error(`Failed to fetch recipes: ${res.status}`);
  }
  const data: { recipes: { name: string }[] } = await res.json();
  return data.recipes.map((r) => r.name);
}
