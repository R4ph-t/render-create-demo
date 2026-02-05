/**
 * Global test setup - runs before all tests
 */

import { existsSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEST_DIR = resolve(__dirname, "../.test-output");

export default function setup() {
  console.log("\n🧹 Cleaning test output directory...\n");
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
}
