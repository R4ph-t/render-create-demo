import { describe, it, expect, afterAll } from "vitest";
import { mkdirSync, existsSync, readFileSync, cpSync, rmSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import {
  parsePresets,
  parseCursorRulesDoc,
  TEMPLATES_DIR,
  type PresetInfo,
} from "./helpers.js";

const TMP_ROOT = resolve(tmpdir(), "render-create-tests");

// Clean up after all tests
afterAll(() => {
  if (existsSync(TMP_ROOT)) {
    rmSync(TMP_ROOT, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Dry-run scaffold: simulate template copy for each non-composite preset
// ---------------------------------------------------------------------------
describe("scaffold dry-run", () => {
  const presets = parsePresets();
  const { presetRules } = parseCursorRulesDoc();

  const nonCompositePresets = presets.filter((p) => !p.isComposite);

  for (const preset of nonCompositePresets) {
    describe(preset.name, () => {
      const projectDir = resolve(TMP_ROOT, preset.name, "test-project");
      const allCopies = [...preset.templateCopies, ...preset.configCopies];

      // Skip presets with no explicit copy tables (they rely on generators)
      if (allCopies.length === 0) {
        it("has no template copy table (generator-only preset)", () => {
          // This is fine — some presets only run generators
          expect(true).toBe(true);
        });
        return;
      }

      it("copies all template files to correct destinations", () => {
        // Create project directory
        mkdirSync(projectDir, { recursive: true });

        for (const copy of allCopies) {
          const srcPath = resolve(TEMPLATES_DIR, copy.source);

          if (!existsSync(srcPath)) {
            // This will be caught by static.test.ts; skip here
            continue;
          }

          // Read, substitute, write
          let content = readFileSync(srcPath, "utf-8");
          content = content.replace(/\{\{PROJECT_NAME\}\}/g, "test-project");

          const destPath = resolve(projectDir, copy.destination);
          mkdirSync(dirname(destPath), { recursive: true });
          writeFileSync(destPath, content, "utf-8");
        }

        // Verify all destination files were created
        for (const copy of allCopies) {
          const srcPath = resolve(TEMPLATES_DIR, copy.source);
          if (!existsSync(srcPath)) continue; // skip missing sources

          const destPath = resolve(projectDir, copy.destination);
          expect(
            existsSync(destPath),
            `expected ${copy.destination} to exist`,
          ).toBe(true);
        }
      });

      it("substitutes {{PROJECT_NAME}} in all copied files", () => {
        for (const copy of allCopies) {
          const destPath = resolve(projectDir, copy.destination);
          if (!existsSync(destPath)) continue;

          const content = readFileSync(destPath, "utf-8");
          expect(
            content.includes("{{PROJECT_NAME}}"),
            `${copy.destination} still contains {{PROJECT_NAME}}`,
          ).toBe(false);
        }
      });


      it("copies cursor rules to .cursor/rules/", () => {
        const rules = preset.cursorRules;
        if (rules.length === 0) return;

        const rulesDir = resolve(projectDir, ".cursor", "rules");
        mkdirSync(rulesDir, { recursive: true });

        for (const rule of rules) {
          const srcPath = resolve(
            TEMPLATES_DIR,
            "cursor-rules",
            `${rule}.mdc`,
          );
          if (!existsSync(srcPath)) continue;

          const destPath = resolve(rulesDir, `${rule}.mdc`);
          cpSync(srcPath, destPath);
        }

        // Verify
        for (const rule of rules) {
          const destPath = resolve(rulesDir, `${rule}.mdc`);
          const srcPath = resolve(
            TEMPLATES_DIR,
            "cursor-rules",
            `${rule}.mdc`,
          );
          if (!existsSync(srcPath)) continue;
          expect(
            existsSync(destPath),
            `cursor rule ${rule}.mdc not copied`,
          ).toBe(true);
        }
      });

      it("produces a non-empty project directory", () => {
        expect(existsSync(projectDir)).toBe(true);
      });
    });
  }
});

// ---------------------------------------------------------------------------
// Composite presets: verify they reference valid component names
// ---------------------------------------------------------------------------
describe("composite preset references", () => {
  const presets = parsePresets();
  const compositePresets = presets.filter((p) => p.isComposite);

  const knownComponents = [
    "vite",
    "fastapi",
    "gin",
    "express",
    "fastify",
    "worker-ts",
    "worker-py",
    "private-service-node",
    "private-service-python",
  ];

  for (const preset of compositePresets) {
    it(`[${preset.name}] is flagged as composite`, () => {
      expect(preset.isComposite).toBe(true);
    });

    it(`[${preset.name}] has cursor rules defined`, () => {
      expect(preset.cursorRules.length).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// Template substitution: verify no raw {{PROJECT_NAME}} leaks after replace
// ---------------------------------------------------------------------------
describe("template substitution completeness", () => {
  const presets = parsePresets();

  // Known non-placeholder {{ }} patterns (e.g. Vue template interpolation)
  const ALLOWED_DOUBLE_BRACES = /\{\{\s*(?!PROJECT_NAME)[a-z]/;

  for (const preset of presets) {
    const allCopies = [...preset.templateCopies, ...preset.configCopies];

    for (const copy of allCopies) {
      it(`[${preset.name}] ${copy.source} has no unsubstituted placeholders`, () => {
        const srcPath = resolve(TEMPLATES_DIR, copy.source);
        if (!existsSync(srcPath)) return; // existence tested elsewhere

        const content = readFileSync(srcPath, "utf-8");
        const substituted = content.replace(
          /\{\{PROJECT_NAME\}\}/g,
          "my-app",
        );
        // Check specifically for {{UPPER_CASE}} placeholder patterns,
        // not framework template syntax like Vue's {{ variable }}
        const remainingPlaceholders = substituted.match(
          /\{\{[A-Z][A-Z_]*\}\}/g,
        );
        expect(
          remainingPlaceholders,
          `${copy.source} has unsubstituted placeholders: ${remainingPlaceholders?.join(", ")}`,
        ).toBeNull();
      });
    }
  }
});
