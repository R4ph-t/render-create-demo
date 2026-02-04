/**
 * Type definitions for cursor-rules CLI
 */

export interface Preset {
  name: string;
  description: string;
  rules: string[];
  configs: string[];
}

export interface PresetsConfig {
  presets: Record<string, Preset>;
}

export interface InitOptions {
  preset?: string;
  yes?: boolean;
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
