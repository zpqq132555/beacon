import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { select } from '@inquirer/prompts';
import type { Platform } from '../../src/core/platforms.js';
import type { SupplyChainConfig } from '../../src/core/supply-chain.js';
import {
  buildNpmUpdateArgs,
  detectBeaconPackageScope,
  detectInstalledBeaconLanguage,
  detectInstalledBeaconTargets,
  formatNpmUpdateCommand,
  formatSkillUpdateCommand,
  updateCommand,
} from '../../src/commands/update.js';

// Mock the interactive select prompt so tests don't hang on CI (no TTY).
vi.mock('@inquirer/prompts', () => ({
  select: vi.fn().mockResolvedValue(false),
}));

vi.mock('child_process', () => ({
  spawn: vi.fn(() => {
    const handlers: Record<string, Array<(value?: unknown) => void>> = {};
    const child = {
      on: vi.fn((event: string, handler: (value?: unknown) => void) => {
        handlers[event] = [...(handlers[event] ?? []), handler];
        return child;
      }),
    };
    setTimeout(() => {
      for (const handler of handlers.exit ?? []) handler(0);
    }, 0);
    return child;
  }),
}));

const mockedSelect = vi.mocked(select);

const claudePlatform: Platform = {
  id: 'claude',
  name: 'Claude Code',
  skillsDir: '.claude',
  openspecToolId: 'claude',
};

const defaultBeaconSource: SupplyChainConfig['beacon'] = {
  packageName: '@zpqq132555/beacon',
  registry: 'https://npm.pkg.github.com',
  latestMetadataUrl: null,
};

describe('update command helpers', () => {
  let tmpDir: string;

  beforeEach(async () => {
    mockedSelect.mockClear();
    tmpDir = path.join(
      os.tmpdir(),
      `beacon-update-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    await fs.mkdir(tmpDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('detects Chinese installed beacon skills from existing skill content', async () => {
    await fs.mkdir(path.join(tmpDir, '.claude', 'skills', 'beacon'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, '.claude', 'skills', 'beacon', 'SKILL.md'),
      '# Beacon\n\n当用户提出需求时，先澄清目标再执行。',
      'utf-8',
    );

    await expect(detectInstalledBeaconLanguage(tmpDir, claudePlatform)).resolves.toBe('zh');
  });

  it('detects English installed beacon skills from existing skill content', async () => {
    await fs.mkdir(path.join(tmpDir, '.claude', 'skills', 'beacon'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, '.claude', 'skills', 'beacon', 'SKILL.md'),
      '# Beacon\n\nUse this skill when starting a new change.',
      'utf-8',
    );

    await expect(detectInstalledBeaconLanguage(tmpDir, claudePlatform)).resolves.toBe('en');
  });

  it('defaults installed beacon language to English when the skills directory is missing', async () => {
    await fs.mkdir(path.join(tmpDir, '.claude'), { recursive: true });

    await expect(detectInstalledBeaconLanguage(tmpDir, claudePlatform)).resolves.toBe('en');
  });

  it('finds only scopes and platforms that already have beacon skills installed', async () => {
    const projectDir = path.join(tmpDir, 'project');
    const globalDir = path.join(tmpDir, 'home');

    await fs.mkdir(path.join(projectDir, '.claude', 'skills', 'beacon'), { recursive: true });
    await fs.writeFile(
      path.join(projectDir, '.claude', 'skills', 'beacon', 'SKILL.md'),
      '# Beacon\n\nUse this skill.',
      'utf-8',
    );

    await fs.mkdir(path.join(projectDir, '.cursor'), { recursive: true });

    await fs.mkdir(path.join(globalDir, '.codex', 'skills', 'beacon'), { recursive: true });
    await fs.writeFile(
      path.join(globalDir, '.codex', 'skills', 'beacon', 'SKILL.md'),
      '# Beacon\n\n当用户提出需求时使用这个技能。',
      'utf-8',
    );

    const targets = await detectInstalledBeaconTargets(projectDir, {
      globalBaseDir: globalDir,
    });

    expect(targets.map((t) => `${t.scope}:${t.platform.id}`)).toEqual([
      'project:claude',
      'global:codex',
    ]);
  });

  it('ignores platform directories that do not contain a skills directory', async () => {
    const projectDir = path.join(tmpDir, 'project');
    await fs.mkdir(path.join(projectDir, '.claude'), { recursive: true });

    await expect(detectInstalledBeaconTargets(projectDir, { scopes: ['project'] })).resolves.toEqual(
      [],
    );
  });

  it('respects explicit scope filtering when detecting installed targets', async () => {
    const projectDir = path.join(tmpDir, 'project');
    const globalDir = path.join(tmpDir, 'home');

    await fs.mkdir(path.join(projectDir, '.claude', 'skills', 'beacon'), { recursive: true });
    await fs.writeFile(path.join(projectDir, '.claude', 'skills', 'beacon', 'SKILL.md'), '# Beacon');
    await fs.mkdir(path.join(globalDir, '.codex', 'skills', 'beacon'), { recursive: true });
    await fs.writeFile(path.join(globalDir, '.codex', 'skills', 'beacon', 'SKILL.md'), '# Beacon');

    const targets = await detectInstalledBeaconTargets(projectDir, {
      globalBaseDir: globalDir,
      scopes: ['global'],
    });

    expect(targets.map((t) => `${t.scope}:${t.platform.id}`)).toEqual(['global:codex']);
  });

  it('ignores former public platform skills when detecting installed targets', async () => {
    const projectDir = path.join(tmpDir, 'project');
    const globalDir = path.join(tmpDir, 'home');

    await fs.mkdir(path.join(globalDir, '.pi', 'skills', 'beacon'), { recursive: true });
    await fs.writeFile(
      path.join(globalDir, '.pi', 'skills', 'beacon', 'SKILL.md'),
      '# Beacon\n\nUse this skill.',
      'utf-8',
    );

    const targets = await detectInstalledBeaconTargets(projectDir, {
      globalBaseDir: globalDir,
      scopes: ['global'],
    });

    expect(targets).toEqual([]);
  });

  it('detects project package scope from local node_modules install path', async () => {
    const projectDir = path.join(tmpDir, 'project');
    const packageRoot = path.join(projectDir, 'node_modules', '@zpqq132555', 'beacon');

    await expect(detectBeaconPackageScope(projectDir, packageRoot)).resolves.toBe('project');
  });

  it('detects project package scope from configured scoped node_modules install path', async () => {
    const projectDir = path.join(tmpDir, 'project');
    const packageRoot = path.join(projectDir, 'node_modules', '@internal', 'beacon');

    await expect(
      detectBeaconPackageScope(projectDir, {
        packageName: '@internal/beacon',
        packageRoot,
      }),
    ).resolves.toBe('project');
  });

  it('detects project package scope from package.json dependencies', async () => {
    const projectDir = path.join(tmpDir, 'project');
    await fs.mkdir(projectDir, { recursive: true });
    await fs.writeFile(
      path.join(projectDir, 'package.json'),
      JSON.stringify({ devDependencies: { '@zpqq132555/beacon': '^0.4.9' } }),
      'utf-8',
    );

    await expect(detectBeaconPackageScope(projectDir, tmpDir)).resolves.toBe('project');
  });

  it.each(['dependencies', 'devDependencies', 'optionalDependencies'] as const)(
    'detects project package scope from configured package.json %s',
    async (field) => {
      const projectDir = path.join(tmpDir, 'project');
      await fs.mkdir(projectDir, { recursive: true });
      await fs.writeFile(
        path.join(projectDir, 'package.json'),
        JSON.stringify({ [field]: { '@internal/beacon': '^0.2.4' } }),
        'utf-8',
      );

      await expect(
        detectBeaconPackageScope(projectDir, {
          packageName: '@internal/beacon',
          packageRoot: tmpDir,
        }),
      ).resolves.toBe('project');
    },
  );

  it('falls back to global package scope when no project install is found', async () => {
    const projectDir = path.join(tmpDir, 'project');
    await fs.mkdir(projectDir, { recursive: true });

    await expect(detectBeaconPackageScope(projectDir, tmpDir)).resolves.toBe('global');
  });

  it('builds npm update args from configured beacon package source', () => {
    expect(buildNpmUpdateArgs('global', defaultBeaconSource)).toEqual([
      'install',
      '-g',
      '@zpqq132555/beacon@latest',
      '--registry',
      'https://npm.pkg.github.com',
    ]);
    expect(
      buildNpmUpdateArgs('project', {
        packageName: '@internal/beacon',
        registry: 'https://npm.internal.example',
        latestMetadataUrl: null,
      }),
    ).toEqual([
      'install',
      '@internal/beacon@latest',
      '--registry',
      'https://npm.internal.example',
    ]);
  });

  it('formats the npm update command from configured beacon package source', () => {
    expect(formatNpmUpdateCommand('global', defaultBeaconSource)).toBe(
      'npm install -g @zpqq132555/beacon@latest --registry https://npm.pkg.github.com',
    );
    expect(
      formatNpmUpdateCommand('project', {
        packageName: '@internal/beacon',
        registry: 'https://npm.internal.example',
        latestMetadataUrl: null,
      }),
    ).toBe(
      'npm install @internal/beacon@latest --registry https://npm.internal.example',
    );
  });

  it('formats the skill update command with the fixed Chinese skill source', () => {
    expect(formatSkillUpdateCommand('project', claudePlatform)).toBe(
      'copy assets/skills-zh -> .claude/skills/ (project)',
    );
    expect(formatSkillUpdateCommand('global', claudePlatform)).toBe(
      'copy assets/skills-zh -> ~/.claude/skills/ (global)',
    );
  });

  it('prints the skill update command when updating installed skills', async () => {
    await fs.mkdir(path.join(tmpDir, '.claude', 'skills', 'beacon'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, '.claude', 'skills', 'beacon', 'SKILL.md'),
      '# Beacon\n\n当用户提出需求时使用这个技能。',
      'utf-8',
    );

    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    let output = '';
    try {
      await updateCommand(tmpDir, { skipNpm: true });
      output = log.mock.calls.map((call) => call.join(' ')).join('\n');
    } finally {
      log.mockRestore();
    }

    expect(output).toContain('$ copy assets/skills-zh -> .claude/skills/ (project)');
    expect(output).not.toContain('language:');
  });

  it('prints structured JSON when requested', async () => {
    await fs.mkdir(path.join(tmpDir, '.claude', 'skills', 'beacon'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, '.claude', 'skills', 'beacon', 'SKILL.md'),
      '# Beacon\n\nUse this skill.',
      'utf-8',
    );

    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    let json = '';
    try {
      await updateCommand(tmpDir, { json: true, skipNpm: true });
      json = log.mock.calls.map((call) => call.join(' ')).join('\n');
    } finally {
      log.mockRestore();
    }

    const result = JSON.parse(json);
    expect(result.npm.scope).toBe('skipped');
    expect(result.skills.totalCopied).toBeGreaterThan(0);
    expect(result.skills.targets[0]).toMatchObject({
      scope: 'project',
      platform: 'claude',
      source: 'skills-zh',
    });
    expect(result.skills.targets[0]).not.toHaveProperty('language');
  });

  it('prints configured npm update command in structured JSON', async () => {
    await fs.mkdir(path.join(tmpDir, '.beacon'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, '.beacon', 'config.yaml'),
      [
        'supply_chain.beacon.package: @internal/beacon',
        'supply_chain.beacon.registry: https://npm.internal.example',
        '',
      ].join('\n'),
      'utf-8',
    );

    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    let json = '';
    try {
      await updateCommand(tmpDir, { json: true, scope: 'global' });
      json = log.mock.calls.map((call) => call.join(' ')).join('\n');
    } finally {
      log.mockRestore();
    }

    const result = JSON.parse(json);
    expect(result.npm).toMatchObject({
      scope: 'global',
      status: 'updated',
      command: 'npm install -g @internal/beacon@latest --registry https://npm.internal.example',
    });
  });

  it('does not prompt to install CodeGraph when the project already has an index', async () => {
    await fs.mkdir(path.join(tmpDir, '.claude', 'skills', 'beacon'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, '.claude', 'skills', 'beacon', 'SKILL.md'),
      '# Beacon\n\nUse this skill.',
      'utf-8',
    );
    await fs.mkdir(path.join(tmpDir, '.codegraph'), { recursive: true });
    await fs.writeFile(path.join(tmpDir, '.codegraph', 'codegraph.db'), '');

    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    try {
      await updateCommand(tmpDir, { skipNpm: true });
    } finally {
      log.mockRestore();
    }

    expect(mockedSelect).not.toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('CodeGraph'),
      }),
    );
  });
});
