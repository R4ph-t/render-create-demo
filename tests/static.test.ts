import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve, extname } from "node:path";
import { execSync } from "node:child_process";
import { parse as parseYAML } from "yaml";
import {
  parsePresets,
  parseCursorRulesDoc,
  TEMPLATES_DIR,
  REFERENCES_DIR,
  ALL_PRESETS,
  templateExists,
  readTemplate,
} from "./helpers.js";

// ---------------------------------------------------------------------------
// 1. Preset names match the canonical list
// ---------------------------------------------------------------------------
describe("preset registry", () => {
  const presets = parsePresets();
  const presetNames = presets.map((p) => p.name);

  it("presets.md contains all 23 expected presets", () => {
    for (const name of ALL_PRESETS) {
      expect(presetNames, `missing preset: ${name}`).toContain(name);
    }
  });

  it("no unexpected presets in presets.md", () => {
    for (const name of presetNames) {
      expect(
        (ALL_PRESETS as readonly string[]).includes(name),
        `unexpected preset: ${name}`,
      ).toBe(true);
    }
  });

  it("each preset has a recipe matching its name", () => {
    for (const p of presets) {
      expect(p.recipe, `preset ${p.name} recipe mismatch`).toBe(p.name);
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Template file existence — every file referenced in copy tables exists
// ---------------------------------------------------------------------------
describe("template file existence", () => {
  const presets = parsePresets();

  for (const preset of presets) {
    const allCopies = [...preset.templateCopies, ...preset.configCopies];
    if (allCopies.length === 0 && preset.isComposite) continue; // composites delegate to components

    for (const copy of allCopies) {
      it(`[${preset.name}] templates/${copy.source} exists`, () => {
        expect(
          templateExists(copy.source),
          `missing: templates/${copy.source}`,
        ).toBe(true);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 3. Cursor rules — every .mdc file referenced exists
// ---------------------------------------------------------------------------
describe("cursor rule files", () => {
  const { ruleFiles, presetRules } = parseCursorRulesDoc();

  for (const file of ruleFiles) {
    it(`cursor-rules/${file} exists`, () => {
      expect(
        existsSync(resolve(TEMPLATES_DIR, "cursor-rules", file)),
        `missing: cursor-rules/${file}`,
      ).toBe(true);
    });
  }

  // Each preset's rules in cursor-rules.md must reference valid .mdc files
  for (const [preset, rules] of Object.entries(presetRules)) {
    for (const rule of rules) {
      it(`[${preset}] cursor rule "${rule}.mdc" exists`, () => {
        expect(
          existsSync(resolve(TEMPLATES_DIR, "cursor-rules", `${rule}.mdc`)),
          `missing: cursor-rules/${rule}.mdc for preset ${preset}`,
        ).toBe(true);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 4. Cursor rules cross-reference: presets.md rules match cursor-rules.md
// ---------------------------------------------------------------------------
describe("cursor rules consistency", () => {
  const presets = parsePresets();
  const { presetRules } = parseCursorRulesDoc();

  for (const preset of presets) {
    if (preset.cursorRules.length === 0) continue;

    it(`[${preset.name}] cursor rules in presets.md match cursor-rules.md`, () => {
      const docRules = presetRules[preset.name];
      expect(
        docRules,
        `preset ${preset.name} not found in cursor-rules.md`,
      ).toBeDefined();
      if (docRules) {
        expect(preset.cursorRules.sort()).toEqual(docRules.sort());
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 5. Gitignore templates exist
// ---------------------------------------------------------------------------
describe("gitignore templates", () => {
  const expected = [
    "node.gitignore",
    "python.gitignore",
    "go.gitignore",
    "ruby.gitignore",
    "elixir.gitignore",
  ];

  for (const file of expected) {
    it(`gitignore/${file} exists`, () => {
      expect(
        existsSync(resolve(TEMPLATES_DIR, "gitignore", file)),
      ).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 6. Template syntax validation
// ---------------------------------------------------------------------------
describe("template syntax", () => {
  const allFiles: string[] = [];

  function collectFiles(dir: string, prefix = "") {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        collectFiles(resolve(dir, entry.name), rel);
      } else {
        allFiles.push(rel);
      }
    }
  }
  collectFiles(TEMPLATES_DIR);

  // TypeScript / JavaScript files
  const tsFiles = allFiles.filter((f) =>
    [".ts", ".tsx", ".js", ".jsx"].includes(extname(f)),
  );
  for (const file of tsFiles) {
    it(`[syntax] ${file} is valid TypeScript`, () => {
      const content = readTemplate(file);
      // Use TypeScript compiler API for a quick syntax check
      const ts = require("typescript");
      const sourceFile = ts.createSourceFile(
        file,
        content,
        ts.ScriptTarget.Latest,
        true,
      );
      // If there are parse diagnostics, the file has syntax errors
      const diagnostics = sourceFile.parseDiagnostics || [];
      const errors = diagnostics.map(
        (d: { messageText: string | { messageText: string } }) =>
          typeof d.messageText === "string"
            ? d.messageText
            : d.messageText.messageText,
      );
      expect(errors, `Syntax errors in ${file}`).toEqual([]);
    });
  }

  // Python files
  const pyFiles = allFiles.filter((f) => extname(f) === ".py");
  for (const file of pyFiles) {
    it(`[syntax] ${file} is valid Python`, () => {
      const filePath = resolve(TEMPLATES_DIR, file);
      try {
        execSync(`python3 -c "import ast; ast.parse(open('${filePath}').read())"`, {
          stdio: "pipe",
        });
      } catch (e: unknown) {
        const err = e as { stderr?: Buffer };
        expect.fail(
          `Python syntax error in ${file}: ${err.stderr?.toString() || "unknown error"}`,
        );
      }
    });
  }

  // YAML files
  const yamlFiles = allFiles.filter((f) =>
    [".yml", ".yaml"].includes(extname(f)),
  );
  for (const file of yamlFiles) {
    it(`[syntax] ${file} is valid YAML`, () => {
      const content = readTemplate(file);
      // Should not throw
      expect(() => parseYAML(content)).not.toThrow();
    });
  }

  // JSON files
  const jsonFiles = allFiles.filter((f) => extname(f) === ".json");
  for (const file of jsonFiles) {
    it(`[syntax] ${file} is valid JSON`, () => {
      const content = readFileSync(resolve(TEMPLATES_DIR, file), "utf-8");
      expect(() => JSON.parse(content)).not.toThrow();
    });
  }

  // TOML files — basic check (not empty, has key=value)
  const tomlFiles = allFiles.filter((f) => extname(f) === ".toml");
  for (const file of tomlFiles) {
    it(`[syntax] ${file} is non-empty TOML`, () => {
      const content = readFileSync(resolve(TEMPLATES_DIR, file), "utf-8");
      expect(content.trim().length).toBeGreaterThan(0);
      // Basic sanity: has at least one key = value or [section]
      expect(content).toMatch(/[[\w]/);
    });
  }

  // Vue files — basic well-formedness (has <template> or <script>)
  const vueFiles = allFiles.filter((f) => extname(f) === ".vue");
  for (const file of vueFiles) {
    it(`[syntax] ${file} is a well-formed Vue SFC`, () => {
      const content = readFileSync(resolve(TEMPLATES_DIR, file), "utf-8");
      expect(
        content.includes("<template") || content.includes("<script"),
        `${file} missing <template> or <script> tag`,
      ).toBe(true);
    });
  }

  // Svelte files — basic well-formedness
  const svelteFiles = allFiles.filter((f) => extname(f) === ".svelte");
  for (const file of svelteFiles) {
    it(`[syntax] ${file} is a well-formed Svelte component`, () => {
      const content = readFileSync(resolve(TEMPLATES_DIR, file), "utf-8");
      expect(content.trim().length).toBeGreaterThan(0);
    });
  }

  // Astro files
  const astroFiles = allFiles.filter((f) => extname(f) === ".astro");
  for (const file of astroFiles) {
    it(`[syntax] ${file} is a well-formed Astro component`, () => {
      const content = readFileSync(resolve(TEMPLATES_DIR, file), "utf-8");
      expect(content.trim().length).toBeGreaterThan(0);
      // Astro files typically have --- frontmatter --- or HTML
      expect(
        content.includes("---") || content.includes("<"),
        `${file} missing frontmatter or HTML`,
      ).toBe(true);
    });
  }

  // Go files — basic syntax check (has package declaration)
  const goFiles = allFiles.filter(
    (f) => extname(f) === ".go" || f.endsWith(".go"),
  );
  for (const file of goFiles) {
    it(`[syntax] ${file} has valid Go structure`, () => {
      const content = readTemplate(file);
      expect(
        content.includes("package "),
        `${file} missing package declaration`,
      ).toBe(true);
    });
  }

  // Ruby files — basic syntax (non-empty, no obvious issues)
  const rbFiles = allFiles.filter((f) => extname(f) === ".rb");
  for (const file of rbFiles) {
    it(`[syntax] ${file} is non-empty Ruby`, () => {
      const content = readFileSync(resolve(TEMPLATES_DIR, file), "utf-8");
      expect(content.trim().length).toBeGreaterThan(0);
    });
  }

  // Elixir files — basic check
  const exFiles = allFiles.filter(
    (f) => extname(f) === ".exs" || extname(f) === ".ex",
  );
  for (const file of exFiles) {
    it(`[syntax] ${file} is non-empty Elixir`, () => {
      const content = readFileSync(resolve(TEMPLATES_DIR, file), "utf-8");
      expect(content.trim().length).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 7. Config files exist
// ---------------------------------------------------------------------------
describe("shared config files", () => {
  const configs = ["configs/biome.json", "configs/tsconfig.base.json", "configs/ruff.toml"];

  for (const file of configs) {
    it(`templates/${file} exists`, () => {
      expect(existsSync(resolve(TEMPLATES_DIR, file))).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 8. All presets have a compose curl command
// ---------------------------------------------------------------------------
describe("preset API integration", () => {
  const content = readFileSync(resolve(REFERENCES_DIR, "presets.md"), "utf-8");

  for (const preset of ALL_PRESETS) {
    it(`[${preset}] has a /v1/compose curl command`, () => {
      const section = extractSection(content, preset);
      expect(
        section.includes("/v1/compose"),
        `${preset} section missing /v1/compose call`,
      ).toBe(true);
    });
  }
});

/** Extract a preset section from presets.md by name */
function extractSection(content: string, name: string): string {
  const regex = new RegExp(`## ${name}\\b`, "m");
  const start = content.search(regex);
  if (start === -1) return "";
  const rest = content.slice(start);
  const nextSection = rest.indexOf("\n---\n");
  return nextSection === -1 ? rest : rest.slice(0, nextSection);
}
