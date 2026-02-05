/**
 * Type definitions for cursor-rules CLI
 */

/** Environment variable from key/value */
export interface EnvVarKeyValue {
  key: string;
  value?: string;
  generateValue?: boolean;
  sync?: boolean;
}

/** Environment variable from database reference */
export interface EnvVarFromDatabase {
  key: string;
  fromDatabase: {
    name: string;
    property: string;
  };
}

/** Environment variable from service reference */
export interface EnvVarFromService {
  key: string;
  fromService: {
    type: string;
    name: string;
    property?: string;
    envVarKey?: string;
  };
}

export type BlueprintEnvVar = EnvVarKeyValue | EnvVarFromDatabase | EnvVarFromService;

/** Route configuration for static sites */
export interface BlueprintRoute {
  type: "redirect" | "rewrite";
  source: string;
  destination: string;
}

/** Service definition in blueprint */
export interface BlueprintService {
  type: "web" | "worker" | "pserv" | "cron";
  name?: string;
  runtime: "node" | "python" | "docker" | "static" | "go" | "rust" | "ruby" | "elixir";
  plan?: string;
  rootDir?: string;
  buildCommand?: string;
  startCommand?: string;
  healthCheckPath?: string;
  staticPublishPath?: string;
  envVars?: BlueprintEnvVar[];
  routes?: BlueprintRoute[];
}

/** Database definition in blueprint */
export interface BlueprintDatabase {
  name: string;
  plan?: string;
  postgresMajorVersion?: string;
}

/** Key Value (Redis) definition in blueprint */
export interface BlueprintKeyValue {
  type: "keyvalue";
  name: string;
  plan?: string;
  maxmemoryPolicy?: string;
  ipAllowList?: Array<{ source: string; description?: string }>;
}

/** Blueprint configuration for render.yaml */
export interface BlueprintConfig {
  services?: BlueprintService[];
  databases?: BlueprintDatabase[];
  keyValues?: BlueprintKeyValue[];
}

export interface Preset {
  name: string;
  description: string;
  rules: string[];
  configs: string[];

  /** Package manager to use (npm, pnpm, yarn, pip) */
  packageManager?: "npm" | "pnpm" | "yarn" | "pip";

  /** Command to scaffold the project (e.g., npx create-next-app) */
  createCommand?: string;

  /** Dependencies to add after create command */
  postCreateDependencies?: string[];
  /** Dev dependencies to add after create command */
  postCreateDevDependencies?: string[];
  /** Scripts to add to package.json after create */
  postCreateScripts?: Record<string, string>;
  /** Files to copy after create command (target -> template source) */
  postCreateFiles?: Record<string, string>;
  /** Files to delete after create command */
  postCreateDelete?: string[];

  /** For presets without createCommand: npm dependencies */
  dependencies?: string[];
  /** For presets without createCommand: npm dev dependencies */
  devDependencies?: string[];
  /** For presets without createCommand: scripts for package.json */
  scripts?: Record<string, string>;
  /** For presets without createCommand: files to scaffold (target -> template) */
  scaffoldFiles?: Record<string, string>;

  /** Python dependencies for requirements.txt */
  pythonDependencies?: string[];

  /** Render Blueprint configuration */
  blueprint?: BlueprintConfig;
}

export interface PresetsConfig {
  presets: Record<string, Preset>;
  components?: ComponentsConfig;
}

// ============================================================================
// Composable Components
// ============================================================================

/** Base component definition */
export interface BaseComponent {
  name: string;
  description?: string;
  subdir: string;
  rules?: string[];
  configs?: string[];
}

/** Blueprint config for frontend deploy types */
export interface FrontendBlueprintConfig {
  type: "web";
  runtime: "node" | "static";
  buildCommand: string;
  startCommand?: string;
  staticPublishPath?: string;
  healthCheckPath?: string;
  envVars?: BlueprintEnvVar[];
  routes?: BlueprintRoute[];
}

/** Frontend component (Next.js, Vite) */
export interface FrontendComponent extends BaseComponent {
  createCommand: string;
  postCreateDependencies?: string[];
  postCreateDevDependencies?: string[];
  postCreateScripts?: Record<string, string>;
  /** Files to copy for static deploy */
  postCreateFilesStatic?: Record<string, string>;
  /** Files to copy for webservice deploy */
  postCreateFilesWebservice?: Record<string, string>;
  /** Files to copy for both deploy types */
  postCreateFiles?: Record<string, string>;
  postCreateDelete?: string[];
  /** Whether this frontend supports webservice deploy (default: true for Next.js, false for Vite) */
  supportsWebservice?: boolean;
  /** Blueprint config for static deploy */
  blueprintStatic: FrontendBlueprintConfig;
  /** Blueprint config for webservice deploy */
  blueprintWebservice?: FrontendBlueprintConfig;
}

/** API component (Fastify, FastAPI) */
export interface ApiComponent extends BaseComponent {
  runtime: "node" | "python";
  /** For Node.js APIs */
  dependencies?: string[];
  devDependencies?: string[];
  scripts?: Record<string, string>;
  /** For Python APIs */
  pythonDependencies?: string[];
  scaffoldFiles: Record<string, string>;
  /** Additional files when database is selected */
  scaffoldFilesWithDb?: Record<string, string>;
  /** Additional dependencies when database is selected */
  dependenciesWithDb?: string[];
  devDependenciesWithDb?: string[];
  pythonDependenciesWithDb?: string[];
  /** Additional scripts when database is selected */
  scriptsWithDb?: Record<string, string>;
  /** Additional rules when database is selected */
  rulesWithDb?: string[];
  blueprint: {
    type: "web";
    runtime: "node" | "python";
    buildCommand: string;
    startCommand: string;
    healthCheckPath: string;
    envVars?: BlueprintEnvVar[];
  };
}

/** Worker type for async components */
export type WorkerType = "worker" | "cron" | "workflow";

/** Worker/Cron/Workflow component */
export interface WorkerComponent extends BaseComponent {
  workerType: WorkerType;
  runtime: "node" | "python";
  /** SDK to install (e.g., @renderinc/sdk for workflows) */
  sdk?: string;
  /** For Node.js workers */
  dependencies?: string[];
  devDependencies?: string[];
  scripts?: Record<string, string>;
  /** For Python workers */
  pythonDependencies?: string[];
  scaffoldFiles: Record<string, string>;
  /** Blueprint config - not available for workflows yet */
  blueprint?: {
    type: "worker" | "cron";
    runtime: "node" | "python";
    buildCommand: string;
    startCommand: string;
    schedule?: string; // For cron jobs
    envVars?: BlueprintEnvVar[];
  };
}

/** Database component (PostgreSQL) */
export interface DatabaseComponent {
  name: string;
  description?: string;
  blueprint: BlueprintDatabase;
}

/** Cache component (Redis/KeyVal) */
export interface CacheComponent {
  name: string;
  description?: string;
  blueprint: BlueprintKeyValue;
}

/** All components configuration */
export interface ComponentsConfig {
  frontends: Record<string, FrontendComponent>;
  apis: Record<string, ApiComponent>;
  workers: Record<string, WorkerComponent>;
  databases: Record<string, DatabaseComponent>;
  caches: Record<string, CacheComponent>;
}

/** User's composable selection */
/** Deploy type for frontend services */
export type DeployType = "static" | "webservice";

export interface ComposableSelection {
  projectName: string;
  frontend: string | null; // Component key or null
  frontendDeployType: DeployType | null; // static or webservice
  apis: string[]; // Array of component keys
  workers: string[]; // Array of component keys
  database: string | null; // Component key or null
  cache: string | null; // Component key or null
  extras: string[]; // env, docker
}

export interface InitOptions {
  preset?: string;
  yes?: boolean;
  name?: string;
  skipInstall?: boolean;
}

export interface SyncOptions {
  force?: boolean;
  dryRun?: boolean;
}

export interface CheckOptions {
  ci?: boolean;
}

export type FileStatus = "in-sync" | "out-of-sync" | "local-missing" | "template-missing";

export interface CompareResult {
  status: FileStatus;
  diff: import("diff").Change[] | null;
}

export interface FileMapping {
  template: string;
  target: string;
}
