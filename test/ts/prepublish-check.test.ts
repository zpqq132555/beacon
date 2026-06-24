import { describe, expect, it } from 'vitest';
import { execFileSync } from 'child_process';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

const scriptPath = path.resolve('scripts/prepublish-check.js');

async function withTempDir(run: (dir: string) => Promise<void>): Promise<void> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'beacon-prepublish-'));
  try {
    await run(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

function runPrepublishCheck(cwd: string): { exitCode: number; output: string } {
  try {
    const output = execFileSync(process.execPath, [scriptPath], {
      cwd,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { exitCode: 0, output };
  } catch (error) {
    const failure = error as { status?: number; stdout?: string; stderr?: string };
    return {
      exitCode: failure.status ?? 1,
      output: `${failure.stdout ?? ''}${failure.stderr ?? ''}`,
    };
  }
}

describe('prepublish check', () => {
  it('keeps scanning changelog history for secrets', async () => {
    await withTempDir(async (dir) => {
      await fs.writeFile(
        path.join(dir, 'CHANGELOG.md'),
        ['Historical note with api_', 'key: "', 'abcdefghijklmnopqrstuvwxyz', '"\n'].join(''),
      );

      const result = runPrepublishCheck(dir);

      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('[SECURITY] Possible API key found in CHANGELOG.md');
    });
  });

  it('keeps scanning archived OpenSpec history for secrets', async () => {
    await withTempDir(async (dir) => {
      const archiveDir = path.join(dir, 'openspec', 'changes', 'archive', '2026-06-24-old');
      await fs.mkdir(archiveDir, { recursive: true });
      await fs.writeFile(
        path.join(archiveDir, 'notes.md'),
        ['Historical note with to', 'ken: "', 'abcdefghijklmnopqrstuvwxyz', '"\n'].join(''),
      );

      const result = runPrepublishCheck(dir);

      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('Possible Secret/token');
      expect(result.output).toContain('openspec');
    });
  });

  it('skips only supply-chain guardrails for historical content', async () => {
    await withTempDir(async (dir) => {
      await fs.writeFile(
        path.join(dir, 'CHANGELOG.md'),
        'Historical note: npm install -g beacon\n',
      );

      const archiveDir = path.join(dir, 'openspec', 'changes', 'archive', '2026-06-24-old');
      await fs.mkdir(archiveDir, { recursive: true });
      await fs.writeFile(
        path.join(archiveDir, 'notes.md'),
        'Historical note: https://registry.npmjs.org\n',
      );

      const result = runPrepublishCheck(dir);

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('[SECURITY] No secrets detected. Safe to publish.');
    });
  });
});
