import { describe, expect, it } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';

describe('run-bats shell runner', () => {
  it('resolves a usable bash instead of directly invoking PATH bash', async () => {
    const content = await fs.readFile(path.resolve('scripts', 'run-bats.js'), 'utf-8');

    expect(content).toContain('function findUsableBash');
    expect(content).toContain('process.env.BEACON_TEST_BASH');
    expect(content).toContain('process.env.BEACON_BASH');
    expect(content).not.toContain("spawnSync('bash'");
  });

  it('rejects WSL bash when resolving bash on Windows', async () => {
    const runner = await fs.readFile(path.resolve('scripts', 'run-bats.js'), 'utf-8');
    const shellTests = await fs.readFile(path.resolve('test', 'ts', 'beacon-scripts.test.ts'), 'utf-8');

    expect(runner).toContain("process.platform === 'win32' && /linux/i.test(probe.stdout)");
    expect(shellTests).toContain("process.platform === 'win32' && /linux/i.test(probe.stdout)");
  });

  it('checks explicit Beacon bash paths before shelling out to discover fallbacks', async () => {
    const content = await fs.readFile(
      path.resolve('assets', 'skills', 'beacon', 'scripts', 'beacon-env.sh'),
      'utf-8',
    );

    const beaconBashCheck = content.indexOf('if _beacon_bash_is_usable "${BEACON_BASH:-}"');
    const currentBashCheck = content.indexOf('if _beacon_bash_is_usable "${BASH:-}"');
    const shellFallback = content.indexOf('command -v sh');

    expect(beaconBashCheck).toBeGreaterThan(-1);
    expect(currentBashCheck).toBeGreaterThan(beaconBashCheck);
    expect(shellFallback).toBeGreaterThan(currentBashCheck);
    expect(content).not.toContain('for _beacon_bash_candidate in \\');
  });
});
