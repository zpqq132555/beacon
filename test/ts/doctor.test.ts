import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

describe('doctor command', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), `beacon-doctor-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await fs.mkdir(tmpDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
    vi.resetModules();
    vi.doUnmock('../../src/core/openspec.js');
    vi.doUnmock('../../src/core/codegraph.js');
  });

  it('accepts current beacon state fields in JSON output', async () => {
    const changeDir = path.join(tmpDir, 'openspec', 'changes', 'current-state');
    await fs.mkdir(changeDir, { recursive: true });
    await fs.writeFile(
      path.join(changeDir, '.beacon.yaml'),
      [
        'workflow: full',
        'phase: verify',
        'build_mode: executing-plans',
        'isolation: branch',
        'verify_mode: full',
        'verify_result: pending',
        'design_doc: docs/superpowers/specs/current-state.md',
        'plan: docs/superpowers/plans/current-state.md',
        'verification_report: docs/superpowers/reports/current-state.md',
        'branch_status: handled',
        'verified_at: null',
        'archived: false',
        '',
      ].join('\n'),
    );

    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    let json = '';
    try {
      const { doctorCommand } = await import('../../src/commands/doctor.js');
      await doctorCommand(tmpDir, { json: true, scope: 'project' });
      json = log.mock.calls.map((call) => call.join(' ')).join('\n');
    } finally {
      log.mockRestore();
    }

    const results = JSON.parse(json).results as Array<{ check: string; status: string }>;
    expect(results.find((result) => result.check === '.beacon.yaml: current-state')).toMatchObject({
      status: 'pass',
    });
  });

  it('only validates top-level keys in .beacon.yaml', async () => {
    const validChangeDir = path.join(tmpDir, 'openspec', 'changes', 'nested-valid');
    await fs.mkdir(validChangeDir, { recursive: true });
    await fs.writeFile(
      path.join(validChangeDir, '.beacon.yaml'),
      [
        'workflow: full',
        'phase: verify',
        'verify_result: pending',
        'archived: false',
        'verification_report:',
        '  nested_key: value',
        '',
      ].join('\n'),
    );

    const invalidChangeDir = path.join(tmpDir, 'openspec', 'changes', 'top-level-invalid');
    await fs.mkdir(invalidChangeDir, { recursive: true });
    await fs.writeFile(
      path.join(invalidChangeDir, '.beacon.yaml'),
      [
        'workflow: full',
        'phase: verify',
        'unknown_root_field: true',
        '',
      ].join('\n'),
    );

    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    let json = '';
    try {
      const { doctorCommand } = await import('../../src/commands/doctor.js');
      await doctorCommand(tmpDir, { json: true, scope: 'project' });
      json = log.mock.calls.map((call) => call.join(' ')).join('\n');
    } finally {
      log.mockRestore();
    }

    const results = JSON.parse(json).results as Array<{ check: string; status: string; message: string }>;

    expect(results.find((result) => result.check === '.beacon.yaml: nested-valid')).toMatchObject({
      status: 'pass',
    });

    expect(results.find((result) => result.check === '.beacon.yaml: top-level-invalid')).toMatchObject({
      status: 'fail',
      message: expect.stringContaining('unknown_root_field'),
    });
  });

  it('uses configured supply chain sources in missing dependency remediation', async () => {
    await fs.mkdir(path.join(tmpDir, '.beacon'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, '.beacon', 'config.yaml'),
      [
        'supply_chain.openspec.package: @internal/openspec@latest',
        'supply_chain.openspec.registry: https://npm.internal.example',
        'supply_chain.codegraph.package: @internal/codegraph',
        'supply_chain.codegraph.registry: https://npm.internal.example',
        '',
      ].join('\n'),
    );

    vi.doMock('../../src/core/openspec.js', () => ({
      isCommandAvailable: () => false,
    }));
    vi.doMock('../../src/core/codegraph.js', () => ({
      hasCodegraphProjectIndex: () => false,
      resolveCodegraphCommand: () => null,
    }));

    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    let json = '';
    try {
      const { doctorCommand } = await import('../../src/commands/doctor.js');
      await doctorCommand(tmpDir, { json: true, scope: 'global' });
      json = log.mock.calls.map((call) => call.join(' ')).join('\n');
    } finally {
      log.mockRestore();
    }

    const results = JSON.parse(json).results as Array<{
      check: string;
      status: string;
      message: string;
    }>;

    expect(results.find((result) => result.check === 'openspec CLI')).toMatchObject({
      status: 'warn',
      message: expect.stringContaining(
        'npm install -g @internal/openspec@latest --registry https://npm.internal.example',
      ),
    });
    expect(results.find((result) => result.check === 'CodeGraph CLI')).toMatchObject({
      status: 'warn',
      message: expect.stringContaining(
        'npm install -g @internal/codegraph --registry https://npm.internal.example',
      ),
    });
  });

  it('explains when private dependency sources are not configured', async () => {
    vi.doMock('../../src/core/openspec.js', () => ({
      isCommandAvailable: () => false,
    }));
    vi.doMock('../../src/core/codegraph.js', () => ({
      hasCodegraphProjectIndex: () => false,
      resolveCodegraphCommand: () => null,
    }));

    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    let json = '';
    try {
      const { doctorCommand } = await import('../../src/commands/doctor.js');
      await doctorCommand(tmpDir, { json: true, scope: 'global' });
      json = log.mock.calls.map((call) => call.join(' ')).join('\n');
    } finally {
      log.mockRestore();
    }

    const results = JSON.parse(json).results as Array<{ check: string; message: string }>;

    expect(results.find((result) => result.check === 'openspec CLI')?.message).toContain(
      'no private OpenSpec registry configured',
    );
    expect(results.find((result) => result.check === 'CodeGraph CLI')?.message).toContain(
      'no private CodeGraph registry configured',
    );
  });
});
