import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { execFileSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

vi.mock('child_process', () => ({
  execFileSync: vi.fn(),
}));

const mockedExecFileSync = vi.mocked(execFileSync);

vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(),
  checkbox: vi.fn(),
}));

const manifestPath = path.resolve('assets', 'manifest.json');

async function readManifest() {
  return JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
}

function mockExternalSuccess() {
  mockedExecFileSync.mockImplementation((command: unknown, args?: unknown, opts?: unknown) => {
    const cmd = String(command);
    const cmdArgs = Array.isArray(args) ? args.map((arg) => String(arg)) : [];

    if (
      (cmd === 'npx' || cmd === 'npx.cmd') &&
      cmdArgs[0] === 'skills' &&
      cmdArgs.includes('--agent') &&
      cmdArgs.includes('claude-code')
    ) {
      const cwd = (opts as { cwd?: string } | undefined)?.cwd ?? os.tmpdir();
      const stagedSkillsDir = path.join(cwd, '.claude', 'skills', 'beacon');
      mkdirSync(stagedSkillsDir, { recursive: true });
      writeFileSync(path.join(stagedSkillsDir, 'SKILL.md'), '# Lingma Beacon\n');
      return Buffer.from('installed');
    }

    if ((cmd === 'which' || cmd === 'where') && cmdArgs[0] === 'openspec') {
      return Buffer.from('/usr/bin/openspec');
    }
    if (cmd === 'openspec' && cmdArgs[0] === 'init') {
      return Buffer.from('ok');
    }
    if ((cmd === 'npx' || cmd === 'npx.cmd') && cmdArgs[0] === 'skills') {
      return Buffer.from('installed');
    }
    return Buffer.from('');
  });
}

async function captureJsonOutput(fn: () => Promise<void>): Promise<Record<string, unknown>> {
  const lines: string[] = [];
  const orig = console.log;
  console.log = vi.fn((...args: unknown[]) => lines.push(String(args[0])));
  try {
    await fn();
  } finally {
    console.log = orig;
  }
  return JSON.parse(lines.join('\n'));
}

describe('beacon init E2E', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = path.join(
      os.tmpdir(),
      `beacon-init-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    await fs.mkdir(tmpDir, { recursive: true });
    vi.resetAllMocks();
    vi.resetModules();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  });

  it('installs Beacon skills at project scope with --yes --json', async () => {
    mockExternalSuccess();
    await fs.mkdir(path.join(tmpDir, '.claude'), { recursive: true });

    const { initCommand } = await import('../../src/commands/init.js');
    const result = await captureJsonOutput(() => initCommand(tmpDir, { yes: true, json: true }));

    expect(result.projectPath).toBe(tmpDir);
    expect(result.scope).toBe('project');
    expect(result.language).toBe('en');
    expect(result.selectedPlatforms).toContain('claude');
    expect(result.workingDirsCreated).toBe(true);

    const claudeResult = (result.results as { platform: string; beacon: string }[]).find(
      (r) => r.platform === 'claude',
    );
    expect(claudeResult?.beacon).toBe('installed');

    const manifest = await readManifest();
    for (const skillPath of manifest.skills) {
      const dest = path.join(tmpDir, '.claude', 'skills', skillPath);
      await expect(fs.access(dest)).resolves.toBeUndefined();
    }

    await expect(fs.stat(path.join(tmpDir, 'docs', 'superpowers', 'specs'))).resolves.toBeDefined();
    await expect(fs.stat(path.join(tmpDir, 'docs', 'superpowers', 'plans'))).resolves.toBeDefined();
  }, 20_000);

  it('installs Beacon skills at global scope', async () => {
    mockExternalSuccess();

    await fs.mkdir(path.join(tmpDir, '.claude'), { recursive: true });
    const fakeHome = path.join(tmpDir, 'fake-home');
    await fs.mkdir(fakeHome, { recursive: true });

    vi.spyOn(os, 'homedir').mockReturnValue(fakeHome);

    const { initCommand } = await import('../../src/commands/init.js');
    const result = await captureJsonOutput(() =>
      initCommand(tmpDir, { yes: true, scope: 'global', json: true }),
    );

    expect(result.scope).toBe('global');
    expect(result.workingDirsCreated).toBe(false);

    const manifest = await readManifest();
    for (const skillPath of manifest.skills) {
      const dest = path.join(fakeHome, '.claude', 'skills', skillPath);
      await expect(fs.access(dest)).resolves.toBeUndefined();
    }

    await expect(fs.stat(path.join(tmpDir, 'docs', 'superpowers', 'specs'))).rejects.toThrow();
  }, 20_000);

  it('skips already-installed Beacon skills with --yes', async () => {
    mockExternalSuccess();
    await fs.mkdir(path.join(tmpDir, '.claude'), { recursive: true });

    const { initCommand } = await import('../../src/commands/init.js');
    const result1 = await captureJsonOutput(() => initCommand(tmpDir, { yes: true, json: true }));
    const claude1 = (result1.results as { platform: string; beacon: string }[]).find(
      (r) => r.platform === 'claude',
    );
    expect(claude1?.beacon).toBe('installed');

    vi.resetModules();
    vi.resetAllMocks();
    mockExternalSuccess();

    const { initCommand: init2 } = await import('../../src/commands/init.js');
    const result2 = await captureJsonOutput(() => init2(tmpDir, { yes: true, json: true }));
    const claude2 = (result2.results as { platform: string; beacon: string }[]).find(
      (r) => r.platform === 'claude',
    );
    expect(claude2?.beacon).toBe('skipped');
  }, 20_000);

  it('overwrites existing Beacon skills with --overwrite', async () => {
    mockExternalSuccess();
    await fs.mkdir(path.join(tmpDir, '.claude'), { recursive: true });

    const { initCommand } = await import('../../src/commands/init.js');
    await captureJsonOutput(() => initCommand(tmpDir, { yes: true, json: true }));

    vi.resetModules();
    vi.resetAllMocks();
    mockExternalSuccess();

    const { initCommand: init2 } = await import('../../src/commands/init.js');
    const result = await captureJsonOutput(() =>
      init2(tmpDir, { yes: true, overwrite: true, json: true }),
    );
    const claude = (result.results as { platform: string; beacon: string }[]).find(
      (r) => r.platform === 'claude',
    );
    expect(claude?.beacon).toBe('installed');
  }, 20_000);

  it('installs all first-batch private platforms from clean directory with --yes', async () => {
    mockExternalSuccess();

    const fakeHome = path.join(tmpDir, 'fake-home');
    await fs.mkdir(fakeHome, { recursive: true });
    const homedirSpy = vi.spyOn(os, 'homedir').mockReturnValue(fakeHome);

    try {
      const { initCommand } = await import('../../src/commands/init.js');
      const result = await captureJsonOutput(() => initCommand(tmpDir, { yes: true, json: true }));

      expect(result.selectedPlatforms).toEqual(['claude', 'cursor', 'codex', 'trae']);
      expect((result.results as unknown[]).length).toBe(4);

      const manifest = await readManifest();
      const platformDirs = ['.claude', '.cursor', '.codex', '.trae'];
      for (const platform of platformDirs) {
        for (const skillPath of manifest.skills) {
          const dest = path.join(tmpDir, platform, 'skills', skillPath);
          await expect(fs.access(dest)).resolves.toBeUndefined();
        }
      }
    } finally {
      homedirSpy.mockRestore();
    }
  }, 20_000);

  it('installs Trae global Beacon skills to the user Trae skills directory', async () => {
    mockExternalSuccess();

    await fs.mkdir(path.join(tmpDir, '.trae'), { recursive: true });
    const fakeHome = path.join(tmpDir, 'fake-home');
    await fs.mkdir(fakeHome, { recursive: true });

    vi.spyOn(os, 'homedir').mockReturnValue(fakeHome);

    const { initCommand } = await import('../../src/commands/init.js');
    const result = await captureJsonOutput(() =>
      initCommand(tmpDir, { yes: true, scope: 'global', json: true }),
    );

    expect(result.selectedPlatforms).toEqual(['trae']);

    const manifest = await readManifest();
    for (const skillPath of manifest.skills) {
      const dest = path.join(fakeHome, '.trae', 'skills', skillPath);
      await expect(fs.access(dest)).resolves.toBeUndefined();
    }

    await expect(
      fs.access(path.join(tmpDir, '.trae', 'skills', 'beacon', 'SKILL.md')),
    ).rejects.toThrow();
  }, 20_000);
});
