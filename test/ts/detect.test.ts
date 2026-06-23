import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import {
  getBaseDir,
  detectPlatforms,
  hasSkills,
  hasPluginSuperpowers,
  hasOpenCodePluginSuperpowers,
} from '../../src/core/detect.js';
import { PLATFORMS, type Platform } from '../../src/core/platforms.js';

const mockPlatform: Platform = {
  id: 'claude',
  name: 'Claude Code',
  skillsDir: '.claude',
  openspecToolId: 'claude',
};

describe('detect', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = path.join(
      os.tmpdir(),
      `beacon-detect-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    await fs.mkdir(tmpDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  describe('getBaseDir', () => {
    it('returns home directory for global scope', () => {
      expect(getBaseDir('global', tmpDir)).toBe(os.homedir());
    });

    it('returns project path for project scope', () => {
      expect(getBaseDir('project', tmpDir)).toBe(tmpDir);
    });
  });

  describe('platform global skills directories', () => {
    it('declares only the first-batch private platforms', () => {
      expect(PLATFORMS.map((platform) => platform.id)).toEqual([
        'claude',
        'cursor',
        'codex',
        'trae',
      ]);
    });

    it('keeps Trae rules-capable and hook-unsupported', () => {
      const trae = PLATFORMS.find((platform) => platform.id === 'trae');

      expect(trae).toMatchObject({
        skillsDir: '.trae',
        globalSkillsDir: '.trae',
        openspecToolId: 'trae',
        rulesDir: 'rules',
        rulesFormat: 'md',
      });
      expect(trae?.supportsHooks).toBeUndefined();
    });
  });

  describe('detectPlatforms', () => {
    it('detects claude platform when .claude directory exists', async () => {
      await fs.mkdir(path.join(tmpDir, '.claude'));
      const detected = await detectPlatforms(tmpDir);
      expect(detected.has('claude')).toBe(true);
    });

    it('detects multiple platforms', async () => {
      await fs.mkdir(path.join(tmpDir, '.claude'));
      await fs.mkdir(path.join(tmpDir, '.cursor'));
      await fs.mkdir(path.join(tmpDir, '.trae'));
      const detected = await detectPlatforms(tmpDir);
      expect(detected.has('claude')).toBe(true);
      expect(detected.has('cursor')).toBe(true);
      expect(detected.has('trae')).toBe(true);
      expect(detected.size).toBeGreaterThanOrEqual(3);
    });

    it('returns empty set when no platforms detected', async () => {
      const detected = await detectPlatforms(tmpDir);
      expect(detected.size).toBe(0);
    });

    it('ignores former public platform directories', async () => {
      await fs.mkdir(path.join(tmpDir, '.agents'));
      await fs.mkdir(path.join(tmpDir, '.github'), { recursive: true });
      await fs.writeFile(path.join(tmpDir, '.github', 'copilot-instructions.md'), '');
      const detected = await detectPlatforms(tmpDir);
      expect(detected.has('antigravity')).toBe(false);
      expect(detected.has('github-copilot')).toBe(false);
    });
  });

  describe('hasSkills', () => {
    it('detects openspec skills when openspec- prefixed dirs exist', async () => {
      await fs.mkdir(path.join(tmpDir, '.claude', 'skills', 'openspec-core'), {
        recursive: true,
      });
      expect(await hasSkills(tmpDir, mockPlatform, 'openspec')).toBe(true);
    });

    it('detects superpowers skills', async () => {
      await fs.mkdir(path.join(tmpDir, '.claude', 'skills', 'brainstorming'), {
        recursive: true,
      });
      await fs.mkdir(path.join(tmpDir, '.claude', 'skills', 'using-superpowers'), {
        recursive: true,
      });
      expect(await hasSkills(tmpDir, mockPlatform, 'superpowers')).toBe(true);
    });

    it('detects beacon skills', async () => {
      await fs.mkdir(path.join(tmpDir, '.claude', 'skills', 'beacon'), { recursive: true });
      expect(await hasSkills(tmpDir, mockPlatform, 'beacon')).toBe(true);
    });

    it('returns false for missing skills', async () => {
      await fs.mkdir(path.join(tmpDir, '.claude', 'skills'), { recursive: true });
      expect(await hasSkills(tmpDir, mockPlatform, 'beacon')).toBe(false);
    });

    it('returns false when skills directory does not exist', async () => {
      expect(await hasSkills(tmpDir, mockPlatform, 'beacon')).toBe(false);
    });

    it('returns false when a platform directory exists without a skills directory', async () => {
      await fs.mkdir(path.join(tmpDir, '.claude'), { recursive: true });

      expect(await hasSkills(tmpDir, mockPlatform, 'beacon')).toBe(false);
    });

    it('detects plugin-installed superpowers for claude platform', async () => {
      const origEnv = process.env.CLAUDE_CONFIG_DIR;
      const pluginDir = path.join(tmpDir, '.claude');
      process.env.CLAUDE_CONFIG_DIR = pluginDir;

      const skillsDir = path.join(
        pluginDir,
        'plugins',
        'cache',
        'claude-plugins-official',
        'superpowers',
        '5.0.0',
        'skills',
      );
      await fs.mkdir(skillsDir, { recursive: true });
      await fs.mkdir(path.join(skillsDir, 'brainstorming'));
      await fs.mkdir(path.join(skillsDir, 'using-superpowers'));

      // No skills in the normal location
      await fs.mkdir(path.join(tmpDir, '.claude', 'skills'), { recursive: true });

      expect(await hasSkills(tmpDir, mockPlatform, 'superpowers')).toBe(true);

      if (origEnv !== undefined) {
        process.env.CLAUDE_CONFIG_DIR = origEnv;
      } else {
        delete process.env.CLAUDE_CONFIG_DIR;
      }
    });

    it('does not detect plugin superpowers for non-claude platforms', async () => {
      const origEnv = process.env.CLAUDE_CONFIG_DIR;
      const pluginDir = path.join(tmpDir, '.claude');
      process.env.CLAUDE_CONFIG_DIR = pluginDir;

      const skillsDir = path.join(
        pluginDir,
        'plugins',
        'cache',
        'claude-plugins-official',
        'superpowers',
        '5.0.0',
        'skills',
      );
      await fs.mkdir(skillsDir, { recursive: true });
      await fs.mkdir(path.join(skillsDir, 'brainstorming'));

      const cursorPlatform: Platform = {
        id: 'cursor',
        name: 'Cursor',
        skillsDir: '.cursor',
        openspecToolId: 'cursor',
      };

      expect(await hasSkills(tmpDir, cursorPlatform, 'superpowers')).toBe(false);

      if (origEnv !== undefined) {
        process.env.CLAUDE_CONFIG_DIR = origEnv;
      } else {
        delete process.env.CLAUDE_CONFIG_DIR;
      }
    });

    it('detects plugin-installed superpowers for codex platform', async () => {
      const origEnv = process.env.CODEX_HOME;
      const pluginDir = path.join(tmpDir, '.codex');
      process.env.CODEX_HOME = pluginDir;

      try {
        const skillsDir = path.join(
          pluginDir,
          'plugins',
          'cache',
          'openai-curated',
          'superpowers',
          'c6ea566d',
          'skills',
        );
        await fs.mkdir(skillsDir, { recursive: true });
        await fs.mkdir(path.join(skillsDir, 'brainstorming'));
        await fs.mkdir(path.join(skillsDir, 'using-superpowers'));

        // No skills in the normal project location.
        await fs.mkdir(path.join(tmpDir, '.codex', 'skills'), { recursive: true });

        const codexPlatform = PLATFORMS.find((platform) => platform.id === 'codex');
        expect(codexPlatform).toBeDefined();
        if (!codexPlatform) return;

        expect(await hasSkills(tmpDir, codexPlatform, 'superpowers')).toBe(true);
      } finally {
        if (origEnv !== undefined) {
          process.env.CODEX_HOME = origEnv;
        } else {
          delete process.env.CODEX_HOME;
        }
      }
    });
  });

  describe('hasPluginSuperpowers', () => {
    it('returns true when superpowers plugin is installed', async () => {
      const origEnv = process.env.CLAUDE_CONFIG_DIR;
      const pluginDir = path.join(tmpDir, '.claude');
      process.env.CLAUDE_CONFIG_DIR = pluginDir;

      const skillsDir = path.join(
        pluginDir,
        'plugins',
        'cache',
        'test-marketplace',
        'superpowers',
        '5.0.0',
        'skills',
      );
      await fs.mkdir(skillsDir, { recursive: true });
      await fs.mkdir(path.join(skillsDir, 'brainstorming'));
      await fs.mkdir(path.join(skillsDir, 'using-superpowers'));

      expect(await hasPluginSuperpowers()).toBe(true);

      if (origEnv !== undefined) {
        process.env.CLAUDE_CONFIG_DIR = origEnv;
      } else {
        delete process.env.CLAUDE_CONFIG_DIR;
      }
    });

    it('returns false when no plugin cache exists', async () => {
      const origEnv = process.env.CLAUDE_CONFIG_DIR;
      process.env.CLAUDE_CONFIG_DIR = path.join(tmpDir, 'nonexistent');

      expect(await hasPluginSuperpowers()).toBe(false);

      if (origEnv !== undefined) {
        process.env.CLAUDE_CONFIG_DIR = origEnv;
      } else {
        delete process.env.CLAUDE_CONFIG_DIR;
      }
    });

    it('returns false when plugin exists but has no matching skills', async () => {
      const origEnv = process.env.CLAUDE_CONFIG_DIR;
      const pluginDir = path.join(tmpDir, '.claude');
      process.env.CLAUDE_CONFIG_DIR = pluginDir;

      const skillsDir = path.join(
        pluginDir,
        'plugins',
        'cache',
        'test-marketplace',
        'superpowers',
        '5.0.0',
        'skills',
      );
      await fs.mkdir(skillsDir, { recursive: true });
      await fs.mkdir(path.join(skillsDir, 'unrelated-skill'));

      expect(await hasPluginSuperpowers()).toBe(false);

      if (origEnv !== undefined) {
        process.env.CLAUDE_CONFIG_DIR = origEnv;
      } else {
        delete process.env.CLAUDE_CONFIG_DIR;
      }
    });
  });

  describe('hasOpenCodePluginSuperpowers', () => {
    it('returns true when superpowers plugin source directory exists with skills', async () => {
      const origEnv = process.env.OPENCODE_CONFIG_DIR;
      const opencodeDir = path.join(tmpDir, '.config', 'opencode');
      process.env.OPENCODE_CONFIG_DIR = opencodeDir;

      const skillsDir = path.join(opencodeDir, 'superpowers', 'skills');
      await fs.mkdir(skillsDir, { recursive: true });
      await fs.mkdir(path.join(skillsDir, 'brainstorming'));
      await fs.mkdir(path.join(skillsDir, 'using-superpowers'));

      expect(await hasOpenCodePluginSuperpowers()).toBe(true);

      if (origEnv !== undefined) {
        process.env.OPENCODE_CONFIG_DIR = origEnv;
      } else {
        delete process.env.OPENCODE_CONFIG_DIR;
      }
    });

    it('returns true when opencode.json contains superpowers plugin entry', async () => {
      const origEnv = process.env.OPENCODE_CONFIG_DIR;
      const opencodeDir = path.join(tmpDir, '.config', 'opencode');
      process.env.OPENCODE_CONFIG_DIR = opencodeDir;

      await fs.mkdir(opencodeDir, { recursive: true });
      await fs.writeFile(
        path.join(opencodeDir, 'opencode.json'),
        JSON.stringify({
          plugin: ['superpowers@git+https://github.com/obra/superpowers.git'],
        }),
      );

      expect(await hasOpenCodePluginSuperpowers()).toBe(true);

      if (origEnv !== undefined) {
        process.env.OPENCODE_CONFIG_DIR = origEnv;
      } else {
        delete process.env.OPENCODE_CONFIG_DIR;
      }
    });

    it('returns false when no superpowers plugin is installed', async () => {
      const origEnv = process.env.OPENCODE_CONFIG_DIR;
      process.env.OPENCODE_CONFIG_DIR = path.join(tmpDir, 'nonexistent');

      expect(await hasOpenCodePluginSuperpowers()).toBe(false);

      if (origEnv !== undefined) {
        process.env.OPENCODE_CONFIG_DIR = origEnv;
      } else {
        delete process.env.OPENCODE_CONFIG_DIR;
      }
    });

    it('returns false when opencode.json exists but has no superpowers entry', async () => {
      const origEnv = process.env.OPENCODE_CONFIG_DIR;
      const opencodeDir = path.join(tmpDir, '.config', 'opencode');
      process.env.OPENCODE_CONFIG_DIR = opencodeDir;

      await fs.mkdir(opencodeDir, { recursive: true });
      await fs.writeFile(
        path.join(opencodeDir, 'opencode.json'),
        JSON.stringify({ plugin: ['some-other-plugin'] }),
      );

      expect(await hasOpenCodePluginSuperpowers()).toBe(false);

      if (origEnv !== undefined) {
        process.env.OPENCODE_CONFIG_DIR = origEnv;
      } else {
        delete process.env.OPENCODE_CONFIG_DIR;
      }
    });

    it('returns false when opencode.json is invalid JSON', async () => {
      const origEnv = process.env.OPENCODE_CONFIG_DIR;
      const opencodeDir = path.join(tmpDir, '.config', 'opencode');
      process.env.OPENCODE_CONFIG_DIR = opencodeDir;

      await fs.mkdir(opencodeDir, { recursive: true });
      await fs.writeFile(path.join(opencodeDir, 'opencode.json'), 'not valid json');

      expect(await hasOpenCodePluginSuperpowers()).toBe(false);

      if (origEnv !== undefined) {
        process.env.OPENCODE_CONFIG_DIR = origEnv;
      } else {
        delete process.env.OPENCODE_CONFIG_DIR;
      }
    });
  });

});
