import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

import { PLATFORMS, type Platform } from '../../src/core/platforms.js';
import {
  removeBeaconSkillsForPlatform,
  removeBeaconRulesForPlatform,
  removeBeaconHooksForPlatform,
  removeWorkingDirs,
} from '../../src/core/uninstall.js';
import {
  copyBeaconSkillsForPlatform,
  copyBeaconRulesForPlatform,
  installBeaconHooksForPlatform,
} from '../../src/core/skills.js';
import { fileExists, removeFile, removeDir, isDirEmpty } from '../../src/utils/file-system.js';

describe('uninstall', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = path.join(
      os.tmpdir(),
      `beacon-uninstall-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    await fs.mkdir(tmpDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  describe('file-system utilities', () => {
    describe('removeFile', () => {
      it('removes an existing file and returns true', async () => {
        const filePath = path.join(tmpDir, 'test.txt');
        await fs.writeFile(filePath, 'hello', 'utf-8');
        expect(await fileExists(filePath)).toBe(true);

        const result = await removeFile(filePath);
        expect(result).toBe(true);
        expect(await fileExists(filePath)).toBe(false);
      });

      it('returns false for non-existent file', async () => {
        const result = await removeFile(path.join(tmpDir, 'nope.txt'));
        expect(result).toBe(false);
      });
    });

    describe('removeDir', () => {
      it('removes an existing directory and returns true', async () => {
        const dirPath = path.join(tmpDir, 'subdir');
        await fs.mkdir(dirPath, { recursive: true });
        await fs.writeFile(path.join(dirPath, 'file.txt'), 'data', 'utf-8');

        const result = await removeDir(dirPath);
        expect(result).toBe(true);
        expect(await fileExists(dirPath)).toBe(false);
      });

      it('returns true for non-existent directory (force mode)', async () => {
        // fs.rm with { force: true } succeeds even if path doesn't exist
        const result = await removeDir(path.join(tmpDir, 'nope'));
        expect(result).toBe(true);
      });

      it('removes a symlinked directory without deleting its target', async () => {
        if (process.platform === 'win32') return; // requires elevated permissions
        // Data-safety: a symlinked skills/rules/hooks dir must be unlinked in
        // place, never recursively removed through to its resolved target.
        const realDir = path.join(tmpDir, 'real-target');
        const realFile = path.join(realDir, 'keep-me.txt');
        await fs.mkdir(realDir, { recursive: true });
        await fs.writeFile(realFile, 'data', 'utf-8');

        const symlinkDir = path.join(tmpDir, 'skills-symlink');
        await fs.symlink(realDir, symlinkDir, 'dir');

        const result = await removeDir(symlinkDir);

        expect(result).toBe(true);
        expect(await fileExists(symlinkDir)).toBe(false);
        expect(await fileExists(realDir)).toBe(true);
        expect(await fileExists(realFile)).toBe(true);
      });
    });

    describe('isDirEmpty', () => {
      it('returns true for empty directory', async () => {
        const dirPath = path.join(tmpDir, 'empty');
        await fs.mkdir(dirPath, { recursive: true });
        expect(await isDirEmpty(dirPath)).toBe(true);
      });

      it('returns false for non-empty directory', async () => {
        const dirPath = path.join(tmpDir, 'notempty');
        await fs.mkdir(dirPath, { recursive: true });
        await fs.writeFile(path.join(dirPath, 'file.txt'), 'data', 'utf-8');
        expect(await isDirEmpty(dirPath)).toBe(false);
      });

      it('returns true for non-existent directory', async () => {
        expect(await isDirEmpty(path.join(tmpDir, 'nope'))).toBe(true);
      });

      it('returns false when the path is not a directory', async () => {
        // readdir on a file throws ENOTDIR (a non-ENOENT error); isDirEmpty
        // must report false so callers never treat an unreadable path as empty.
        const filePath = path.join(tmpDir, 'a-file.txt');
        await fs.writeFile(filePath, 'data', 'utf-8');
        expect(await isDirEmpty(filePath)).toBe(false);
      });
    });
  });

  describe('removeBeaconSkillsForPlatform', () => {
    const claudePlatform: Platform = PLATFORMS.find((p) => p.id === 'claude')!;

    it('removes installed Beacon skills', async () => {
      await copyBeaconSkillsForPlatform(tmpDir, claudePlatform, true, 'skills', 'project');

      const skillsDir = path.join(tmpDir, '.claude', 'skills');
      const entriesBefore = await fs.readdir(skillsDir);
      const beaconEntries = entriesBefore.filter((e) => e.startsWith('beacon'));
      expect(beaconEntries.length).toBeGreaterThan(0);

      const result = await removeBeaconSkillsForPlatform(tmpDir, claudePlatform, 'project');
      expect(result.removed).toBeGreaterThan(0);

      for (const entry of beaconEntries) {
        expect(await fileExists(path.join(skillsDir, entry))).toBe(false);
      }
    });

    it('handles already-removed skills gracefully', async () => {
      const result = await removeBeaconSkillsForPlatform(tmpDir, claudePlatform, 'project');
      expect(result.removed).toBe(0);
      expect(result.failed).toBe(0);
    });

  });

  describe('removeBeaconRulesForPlatform', () => {
    it('removes rules for a platform that supports them', async () => {
      const claudePlatform: Platform = PLATFORMS.find((p) => p.id === 'claude')!;

      await copyBeaconRulesForPlatform(tmpDir, claudePlatform, true, 'project');

      const rulePath = path.join(tmpDir, '.claude', 'rules', 'beacon-phase-guard.md');
      expect(await fileExists(rulePath)).toBe(true);

      const result = await removeBeaconRulesForPlatform(tmpDir, claudePlatform, 'project');
      expect(result.removed).toBeGreaterThan(0);
      expect(await fileExists(rulePath)).toBe(false);
    });

    it('removes Cursor MDC format rules', async () => {
      const cursorPlatform: Platform = PLATFORMS.find((p) => p.id === 'cursor')!;

      await copyBeaconRulesForPlatform(tmpDir, cursorPlatform, true, 'project');

      const rulePath = path.join(tmpDir, '.cursor', 'rules', 'beacon-phase-guard.mdc');
      expect(await fileExists(rulePath)).toBe(true);

      const result = await removeBeaconRulesForPlatform(tmpDir, cursorPlatform, 'project');
      expect(result.removed).toBeGreaterThan(0);
      expect(await fileExists(rulePath)).toBe(false);
    });

    it('removes Trae rules', async () => {
      const traePlatform: Platform = PLATFORMS.find((p) => p.id === 'trae')!;

      await copyBeaconRulesForPlatform(tmpDir, traePlatform, true, 'project');

      const rulePath = path.join(tmpDir, '.trae', 'rules', 'beacon-phase-guard.md');
      expect(await fileExists(rulePath)).toBe(true);

      const result = await removeBeaconRulesForPlatform(tmpDir, traePlatform, 'project');
      expect(result.removed).toBeGreaterThan(0);
      expect(await fileExists(rulePath)).toBe(false);
    });

    it('skips platforms without rules support', async () => {
      const noRulesPlatform: Platform = {
        id: 'custom',
        name: 'Custom',
        skillsDir: '.custom',
        openspecToolId: 'custom',
      };
      const result = await removeBeaconRulesForPlatform(tmpDir, noRulesPlatform, 'project');
      expect(result.removed).toBe(0);
    });
  });

  describe('removeBeaconHooksForPlatform', () => {
    it('removes Claude Code hooks while preserving non-Beacon hooks', async () => {
      const claudePlatform: Platform = PLATFORMS.find((p) => p.id === 'claude')!;

      const settingsDir = path.join(tmpDir, '.claude');
      await fs.mkdir(settingsDir, { recursive: true });
      const settingsPath = path.join(settingsDir, 'settings.local.json');
      const settings = {
        hooks: {
          PreToolUse: [
            {
              matcher: 'Write|Edit',
              hooks: [
                {
                  type: 'command',
                  command: 'bash .claude/skills/beacon/scripts/beacon-hook-guard.sh',
                },
                { type: 'command', command: 'bash my-custom-hook.sh' },
              ],
            },
          ],
        },
      };
      await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');

      await installBeaconHooksForPlatform(tmpDir, claudePlatform, 'project');

      const result = await removeBeaconHooksForPlatform(tmpDir, claudePlatform, 'project');
      expect(result.removed).toBeGreaterThan(0);

      const updatedContent = await fs.readFile(settingsPath, 'utf-8');
      const updated = JSON.parse(updatedContent);
      expect(updated.hooks.PreToolUse).toBeDefined();
      expect(updated.hooks.PreToolUse.length).toBeGreaterThan(0);

      const allCommands = updated.hooks.PreToolUse.flatMap((g: Record<string, unknown>) =>
        (g.hooks as Array<Record<string, unknown>>).map((h: Record<string, unknown>) => h.command),
      );
      expect(allCommands).toContain('bash my-custom-hook.sh');
      expect(allCommands.some((c: string) => c.includes('beacon-hook-guard'))).toBe(false);
    });

    it('skips platforms without hooks support', async () => {
      const traePlatform: Platform = PLATFORMS.find((p) => p.id === 'trae')!;
      const result = await removeBeaconHooksForPlatform(tmpDir, traePlatform, 'project');
      expect(result.removed).toBe(0);
    });

    it('cleans up empty hooks section after removal', async () => {
      const claudePlatform: Platform = PLATFORMS.find((p) => p.id === 'claude')!;
      const settingsDir = path.join(tmpDir, '.claude');
      await fs.mkdir(settingsDir, { recursive: true });
      const settingsPath = path.join(settingsDir, 'settings.local.json');

      const settings = {
        hooks: {
          PreToolUse: [
            {
              matcher: 'Write|Edit',
              hooks: [
                {
                  type: 'command',
                  command: 'bash .claude/skills/beacon/scripts/beacon-hook-guard.sh',
                },
              ],
            },
          ],
        },
      };
      await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');

      const result = await removeBeaconHooksForPlatform(tmpDir, claudePlatform, 'project');
      expect(result.removed).toBe(1);

      const updatedContent = await fs.readFile(settingsPath, 'utf-8');
      const updated = JSON.parse(updatedContent);
      expect(updated.hooks).toBeUndefined();
    });
  });

  describe('removeWorkingDirs', () => {
    it('removes .beacon directory', async () => {
      const beaconDir = path.join(tmpDir, '.beacon');
      await fs.mkdir(beaconDir, { recursive: true });
      await fs.writeFile(path.join(beaconDir, 'config.yaml'), 'test: true', 'utf-8');

      const result = await removeWorkingDirs(tmpDir);
      expect(result.removed).toBeGreaterThan(0);
      expect(await fileExists(beaconDir)).toBe(false);
    });

    it('removes empty docs/superpowers directories', async () => {
      const specsDir = path.join(tmpDir, 'docs', 'superpowers', 'specs');
      const plansDir = path.join(tmpDir, 'docs', 'superpowers', 'plans');
      await fs.mkdir(specsDir, { recursive: true });
      await fs.mkdir(plansDir, { recursive: true });

      await removeWorkingDirs(tmpDir);

      expect(await fileExists(path.join(tmpDir, 'docs'))).toBe(false);
    });

    it('preserves non-empty docs directories', async () => {
      const specsDir = path.join(tmpDir, 'docs', 'superpowers', 'specs');
      await fs.mkdir(specsDir, { recursive: true });
      await fs.writeFile(path.join(specsDir, 'important.md'), 'keep me', 'utf-8');

      await removeWorkingDirs(tmpDir);

      expect(await fileExists(path.join(tmpDir, 'docs'))).toBe(true);
      expect(await fileExists(path.join(specsDir, 'important.md'))).toBe(true);
    });
  });

  describe('full uninstall cycle', () => {
    it('installs and then completely removes Beacon for Claude Code', async () => {
      const claudePlatform: Platform = PLATFORMS.find((p) => p.id === 'claude')!;

      // Install everything
      await copyBeaconSkillsForPlatform(tmpDir, claudePlatform, true, 'skills', 'project');
      await copyBeaconRulesForPlatform(tmpDir, claudePlatform, true, 'project');
      await installBeaconHooksForPlatform(tmpDir, claudePlatform, 'project');

      // Verify installation
      const skillsDir = path.join(tmpDir, '.claude', 'skills');
      const skillEntries = (await fs.readdir(skillsDir)).filter((e) => e.startsWith('beacon'));
      expect(skillEntries.length).toBeGreaterThan(0);

      const rulePath = path.join(tmpDir, '.claude', 'rules', 'beacon-phase-guard.md');
      expect(await fileExists(rulePath)).toBe(true);

      // Uninstall everything
      const skillsResult = await removeBeaconSkillsForPlatform(tmpDir, claudePlatform, 'project');
      expect(skillsResult.removed).toBeGreaterThan(0);

      const rulesResult = await removeBeaconRulesForPlatform(tmpDir, claudePlatform, 'project');
      expect(rulesResult.removed).toBeGreaterThan(0);

      const hooksResult = await removeBeaconHooksForPlatform(tmpDir, claudePlatform, 'project');
      expect(hooksResult.removed).toBeGreaterThan(0);

      // Verify complete removal
      for (const entry of skillEntries) {
        expect(await fileExists(path.join(skillsDir, entry))).toBe(false);
      }
      expect(await fileExists(rulePath)).toBe(false);
    });
  });
});

// --- uninstallCommand interactive selection tests ---

vi.mock('@inquirer/prompts', () => ({
  select: vi.fn().mockResolvedValue(true),
  checkbox: vi.fn().mockResolvedValue([]),
}));

import { select, checkbox } from '@inquirer/prompts';
import { uninstallCommand } from '../../src/commands/uninstall.js';

const mockedSelect = vi.mocked(select);
const mockedCheckbox = vi.mocked(checkbox);

describe('uninstallCommand interactive selection', () => {
  let tmpDir: string;

  beforeEach(async () => {
    mockedSelect.mockReset();
    mockedCheckbox.mockReset();
    mockedSelect.mockResolvedValue(true as never);
    tmpDir = path.join(
      os.tmpdir(),
      `beacon-uninstall-cmd-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    await fs.mkdir(tmpDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('auto-selects single target and uninstalls on confirmation', async () => {
    const claudePlatform = PLATFORMS.find((p) => p.id === 'claude')!;
    await copyBeaconSkillsForPlatform(tmpDir, claudePlatform, true, 'skills', 'project');

    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    try {
      await uninstallCommand(tmpDir, { force: false });
    } finally {
      log.mockRestore();
    }

    expect(mockedSelect).toHaveBeenCalled();
    expect(mockedCheckbox).not.toHaveBeenCalled();

    const skillsDir = path.join(tmpDir, '.claude', 'skills');
    const entries = (await fs.readdir(skillsDir)).filter((e) => e.startsWith('beacon'));
    expect(entries.length).toBe(0);
  });

  it('cancels when single target user declines', async () => {
    const claudePlatform = PLATFORMS.find((p) => p.id === 'claude')!;
    await copyBeaconSkillsForPlatform(tmpDir, claudePlatform, true, 'skills', 'project');

    mockedSelect.mockResolvedValue(false as never);

    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    try {
      await uninstallCommand(tmpDir, { force: false });
    } finally {
      log.mockRestore();
    }

    const skillsDir = path.join(tmpDir, '.claude', 'skills');
    const entries = (await fs.readdir(skillsDir)).filter((e) => e.startsWith('beacon'));
    expect(entries.length).toBeGreaterThan(0);
  });

  it('shows checkbox when multiple targets detected', async () => {
    const claudePlatform = PLATFORMS.find((p) => p.id === 'claude')!;
    await copyBeaconSkillsForPlatform(tmpDir, claudePlatform, true, 'skills', 'project');
    // Create a second platform (codex) fixture
    const codexDir = path.join(tmpDir, '.codex', 'skills', 'beacon');
    await fs.mkdir(codexDir, { recursive: true });
    await fs.writeFile(path.join(codexDir, 'SKILL.md'), '# Beacon', 'utf-8');

    mockedCheckbox.mockResolvedValue(['claude:project'] as never);

    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    try {
      await uninstallCommand(tmpDir, { force: false });
    } finally {
      log.mockRestore();
    }

    expect(mockedCheckbox).toHaveBeenCalled();
    expect(mockedSelect).not.toHaveBeenCalled();

    // Claude should be uninstalled
    const claudeSkillsDir = path.join(tmpDir, '.claude', 'skills');
    const claudeEntries = (await fs.readdir(claudeSkillsDir)).filter((e) => e.startsWith('beacon'));
    expect(claudeEntries.length).toBe(0);

    // Codex should remain
    expect(await fileExists(path.join(codexDir, 'SKILL.md'))).toBe(true);
  });

  it('skips prompt with --force and uninstalls all', async () => {
    const claudePlatform = PLATFORMS.find((p) => p.id === 'claude')!;
    await copyBeaconSkillsForPlatform(tmpDir, claudePlatform, true, 'skills', 'project');

    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    try {
      await uninstallCommand(tmpDir, { force: true });
    } finally {
      log.mockRestore();
    }

    expect(mockedSelect).not.toHaveBeenCalled();
    expect(mockedCheckbox).not.toHaveBeenCalled();

    const skillsDir = path.join(tmpDir, '.claude', 'skills');
    const entries = (await fs.readdir(skillsDir)).filter((e) => e.startsWith('beacon'));
    expect(entries.length).toBe(0);
  });

  it('skips prompt with --json and uninstalls all', async () => {
    const claudePlatform = PLATFORMS.find((p) => p.id === 'claude')!;
    await copyBeaconSkillsForPlatform(tmpDir, claudePlatform, true, 'skills', 'project');

    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    let jsonOutput;
    try {
      await uninstallCommand(tmpDir, { json: true });
      jsonOutput = log.mock.calls.map((c) => c.join(' ')).join('\n');
    } finally {
      log.mockRestore();
    }

    expect(mockedSelect).not.toHaveBeenCalled();
    expect(mockedCheckbox).not.toHaveBeenCalled();

    const result = JSON.parse(jsonOutput);
    expect(result.summary.targetsProcessed).toBeGreaterThan(0);
  });

  it('prints message when no targets found', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    let output;
    try {
      await uninstallCommand(tmpDir);
      output = log.mock.calls.map((c) => c.join(' ')).join('\n');
    } finally {
      log.mockRestore();
    }

    expect(output).toContain('No Beacon installations found');
    expect(mockedSelect).not.toHaveBeenCalled();
  });
});
