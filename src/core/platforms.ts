/**
 * Platform Definitions
 *
 * First-batch private Beacon distribution platforms.
 */

import type { InstallScope } from './types.js';

export interface Platform {
  id: string;
  name: string;
  skillsDir: string;
  globalSkillsDir?: string;
  detectionPaths?: string[];
  openspecToolId: string;
  /** Platform's rules/instructions subdirectory relative to rulesBaseDir (defaults to baseDir). Omit if unsupported. */
  rulesDir?: string;
  /** Override base directory for rules. When set, rules go to rulesBaseDir/rulesDir instead of skillsDir/rulesDir. */
  rulesBaseDir?: string;
  /** Rule file format: 'md' = plain markdown, 'mdc' = Cursor MDC with frontmatter, 'copilot' = GitHub Copilot instructions format. */
  rulesFormat?: 'md' | 'mdc' | 'copilot';
  /** Whether this platform supports PreToolUse hooks. */
  supportsHooks?: boolean;
  /** Hook configuration format. Determines how installBeaconHooksForPlatform writes the hook config. */
  hookFormat?: 'claude-code' | 'gemini' | 'windsurf' | 'copilot' | 'qwen' | 'kiro' | 'qoder';
}

export function getPlatformSkillsDir(platform: Platform, scope: InstallScope): string {
  if (scope === 'global' && platform.globalSkillsDir) {
    return platform.globalSkillsDir;
  }
  return platform.skillsDir;
}

export function getPlatformSkillsDirs(platform: Platform, scope: InstallScope): string[] {
  return [getPlatformSkillsDir(platform, scope)];
}

export const PLATFORMS: Platform[] = [
  {
    id: 'claude',
    name: 'Claude Code',
    skillsDir: '.claude',
    globalSkillsDir: '.claude',
    openspecToolId: 'claude',
    rulesDir: 'rules',
    rulesFormat: 'md',
    supportsHooks: true,
    hookFormat: 'claude-code',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    skillsDir: '.cursor',
    globalSkillsDir: '.cursor',
    openspecToolId: 'cursor',
    rulesDir: 'rules',
    rulesFormat: 'mdc',
  },
  {
    id: 'codex',
    name: 'Codex',
    skillsDir: '.codex',
    globalSkillsDir: '.codex',
    openspecToolId: 'codex',
    rulesDir: 'rules',
    rulesFormat: 'md',
    supportsHooks: true,
    hookFormat: 'claude-code',
  },
  {
    id: 'trae',
    name: 'Trae',
    skillsDir: '.trae',
    globalSkillsDir: '.trae',
    openspecToolId: 'trae',
    rulesDir: 'rules',
    rulesFormat: 'md',
  },
];
