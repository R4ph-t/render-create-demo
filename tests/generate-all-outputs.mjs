#!/usr/bin/env node
/**
 * Generate all composable project combinations for review
 */

import { scaffoldComposableProject } from "../dist/commands/init.js";
import { loadPresets } from "../dist/utils.js";
import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUTPUT_DIR = "/Users/raph/Documents/dev/render-demo-outputs";

const presetsConfig = loadPresets();
const components = presetsConfig.components;

// Composable combinations to create
const combinations = [
  // Frontend only variations
  { name: "composable-nextjs-static", frontend: "nextjs", frontendDeployType: "static", apis: [], workers: [], database: null, cache: null, extras: ["env"] },
  { name: "composable-nextjs-webservice", frontend: "nextjs", frontendDeployType: "webservice", apis: [], workers: [], database: null, cache: null, extras: ["env"] },
  { name: "composable-vite-static", frontend: "vite", frontendDeployType: "static", apis: [], workers: [], database: null, cache: null, extras: ["env"] },
  
  // API only variations
  { name: "composable-fastify-only", frontend: null, frontendDeployType: null, apis: ["fastify"], workers: [], database: null, cache: null, extras: ["env"] },
  { name: "composable-fastapi-only", frontend: null, frontendDeployType: null, apis: ["fastapi"], workers: [], database: null, cache: null, extras: ["env"] },
  { name: "composable-both-apis", frontend: null, frontendDeployType: null, apis: ["fastify", "fastapi"], workers: [], database: null, cache: null, extras: ["env"] },
  
  // API + DB variations
  { name: "composable-fastify-postgres", frontend: null, frontendDeployType: null, apis: ["fastify"], workers: [], database: "postgres", cache: null, extras: ["env"] },
  { name: "composable-fastapi-postgres", frontend: null, frontendDeployType: null, apis: ["fastapi"], workers: [], database: "postgres", cache: null, extras: ["env"] },
  
  // API + Cache variations
  { name: "composable-fastify-redis", frontend: null, frontendDeployType: null, apis: ["fastify"], workers: [], database: null, cache: "redis", extras: ["env"] },
  
  // Worker variations
  { name: "composable-worker-ts", frontend: null, frontendDeployType: null, apis: [], workers: ["worker-ts"], database: null, cache: null, extras: ["env"] },
  { name: "composable-worker-py", frontend: null, frontendDeployType: null, apis: [], workers: ["worker-py"], database: null, cache: null, extras: ["env"] },
  { name: "composable-cron-ts", frontend: null, frontendDeployType: null, apis: [], workers: ["cron-ts"], database: null, cache: null, extras: ["env"] },
  { name: "composable-cron-py", frontend: null, frontendDeployType: null, apis: [], workers: ["cron-py"], database: null, cache: null, extras: ["env"] },
  { name: "composable-workflow-ts", frontend: null, frontendDeployType: null, apis: [], workers: ["workflow-ts"], database: null, cache: null, extras: ["env"] },
  { name: "composable-workflow-py", frontend: null, frontendDeployType: null, apis: [], workers: ["workflow-py"], database: null, cache: null, extras: ["env"] },
  
  // Full stack combinations
  { name: "composable-nextjs-fastify-postgres", frontend: "nextjs", frontendDeployType: "webservice", apis: ["fastify"], workers: [], database: "postgres", cache: null, extras: ["env", "docker"] },
  { name: "composable-vite-fastapi-postgres", frontend: "vite", frontendDeployType: "static", apis: ["fastapi"], workers: [], database: "postgres", cache: null, extras: ["env", "docker"] },
  
  // Everything kitchen sink
  { name: "composable-kitchen-sink", frontend: "nextjs", frontendDeployType: "webservice", apis: ["fastify", "fastapi"], workers: ["worker-ts", "cron-py", "workflow-ts"], database: "postgres", cache: "redis", extras: ["env", "docker"] },
];

async function main() {
  for (const combo of combinations) {
    const projectDir = join(OUTPUT_DIR, combo.name);
    
    if (existsSync(projectDir)) {
      console.log(`Skipping ${combo.name} (already exists)`);
      continue;
    }
    
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Creating: ${combo.name}`);
    console.log(`${"=".repeat(60)}`);
    
    process.chdir(OUTPUT_DIR);
    
    try {
      await scaffoldComposableProject(
        {
          projectName: combo.name,
          frontend: combo.frontend,
          frontendDeployType: combo.frontendDeployType,
          apis: combo.apis,
          workers: combo.workers,
          database: combo.database,
          cache: combo.cache,
          extras: combo.extras,
        },
        components,
        true // skipInstall
      );
      console.log(`✓ Created ${combo.name}`);
    } catch (error) {
      console.error(`✗ Failed to create ${combo.name}:`, error.message);
    }
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("All projects created in:", OUTPUT_DIR);
  console.log("=".repeat(60));
}

main().catch(console.error);
