import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

import {
  buildBeaconLatestMetadataUrl,
  buildRegistryNpmArgs,
  getSupplyChainSourceStatus,
  loadSupplyChainConfig,
} from '../../src/core/supply-chain.js';

describe('supply chain config', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = path.join(
      os.tmpdir(),
      `beacon-supply-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    await fs.mkdir(tmpDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('uses GitHub Packages defaults for Beacon without requiring project config', async () => {
    const config = await loadSupplyChainConfig(tmpDir, {});

    expect(config.beacon.packageName).toBe('@zpqq132555/beacon');
    expect(config.beacon.registry).toBe('https://npm.pkg.github.com');
    expect(config.beacon.latestMetadataUrl).toBeNull();
    expect(config.openspec.packageSpec).toBe('@fission-ai/openspec@latest');
    expect(config.openspec.registry).toBeNull();
    expect(config.superpowers.source).toBe('obra/superpowers');
    expect(config.codegraph.packageSpec).toBe('@colbymchenry/codegraph');
    expect(config.codegraph.registry).toBeNull();
  });

  it('reads project .beacon/config.yaml supply chain keys', async () => {
    await fs.mkdir(path.join(tmpDir, '.beacon'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, '.beacon', 'config.yaml'),
      [
        'supply_chain.beacon.package: @internal/beacon',
        'supply_chain.beacon.registry: https://npm.internal.example',
        'supply_chain.beacon.latest_metadata_url: https://npm.internal.example/beacon/latest',
        'supply_chain.openspec.package: @internal/openspec@latest',
        'supply_chain.openspec.registry: https://npm.internal.example',
        'supply_chain.superpowers.source: internal/superpowers',
        'supply_chain.codegraph.package: @internal/codegraph',
        'supply_chain.codegraph.registry: https://npm.internal.example',
        '',
      ].join('\n'),
      'utf-8',
    );

    const config = await loadSupplyChainConfig(tmpDir, {});

    expect(config.beacon.packageName).toBe('@internal/beacon');
    expect(config.beacon.registry).toBe('https://npm.internal.example');
    expect(config.beacon.latestMetadataUrl).toBe('https://npm.internal.example/beacon/latest');
    expect(config.openspec.packageSpec).toBe('@internal/openspec@latest');
    expect(config.openspec.registry).toBe('https://npm.internal.example');
    expect(config.superpowers.source).toBe('internal/superpowers');
    expect(config.codegraph.packageSpec).toBe('@internal/codegraph');
    expect(config.codegraph.registry).toBe('https://npm.internal.example');
  });

  it('unquotes project .beacon/config.yaml supply chain values', async () => {
    await fs.mkdir(path.join(tmpDir, '.beacon'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, '.beacon', 'config.yaml'),
      'supply_chain.beacon.registry: "https://npm.internal.example"\n',
      'utf-8',
    );

    const config = await loadSupplyChainConfig(tmpDir, {});

    expect(config.beacon.registry).toBe('https://npm.internal.example');
  });

  it('lets environment variables override project config', async () => {
    await fs.mkdir(path.join(tmpDir, '.beacon'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, '.beacon', 'config.yaml'),
      [
        'supply_chain.beacon.registry: https://file.example',
        'supply_chain.superpowers.source: file/superpowers',
        '',
      ].join('\n'),
      'utf-8',
    );

    const config = await loadSupplyChainConfig(tmpDir, {
      BEACON_NPM_REGISTRY: 'https://env.example',
      BEACON_SUPERPOWERS_SOURCE: 'env/superpowers',
    });

    expect(config.beacon.registry).toBe('https://env.example');
    expect(config.superpowers.source).toBe('env/superpowers');
  });

  it('builds npm args with registry only when configured', () => {
    expect(buildRegistryNpmArgs(['install', '-g', '@zpqq132555/beacon@latest'], null)).toEqual([
      'install',
      '-g',
      '@zpqq132555/beacon@latest',
    ]);
    expect(
      buildRegistryNpmArgs(
        ['install', '-g', '@zpqq132555/beacon@latest'],
        'https://npm.internal.example',
      ),
    ).toEqual([
      'install',
      '-g',
      '@zpqq132555/beacon@latest',
      '--registry',
      'https://npm.internal.example',
    ]);
  });

  it('returns null latest metadata URL when no private metadata source is configured', async () => {
    const config = await loadSupplyChainConfig(tmpDir, {});

    expect(buildBeaconLatestMetadataUrl(config)).toBeNull();
  });

  it('reports missing private sources as non-fatal with user-facing guidance', async () => {
    const config = await loadSupplyChainConfig(tmpDir, {});

    const status = getSupplyChainSourceStatus(config, 'beacon.latestMetadataUrl');

    expect(status.ok).toBe(false);
    expect(status.fatal).toBe(false);
    expect(status.message).toBe(
      'Beacon latest metadata source is not configured; skipping private version check.',
    );
    expect(status.hint).toBe(
      'Set supply_chain.beacon.latest_metadata_url in .beacon/config.yaml or BEACON_LATEST_METADATA_URL.',
    );
  });

  it('reports the default Superpowers source as an unconfigured private source', async () => {
    const config = await loadSupplyChainConfig(tmpDir, {});

    const status = getSupplyChainSourceStatus(config, 'superpowers.source');

    expect(status.ok).toBe(false);
    expect(status.fatal).toBe(false);
    expect(status.message).toBe(
      'Superpowers skill source is not configured; skipping private skill source override.',
    );
  });

  it('reports Superpowers source as configured when loaded from project config', async () => {
    await fs.mkdir(path.join(tmpDir, '.beacon'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, '.beacon', 'config.yaml'),
      'supply_chain.superpowers.source: internal/superpowers\n',
      'utf-8',
    );

    const config = await loadSupplyChainConfig(tmpDir, {});

    expect(config).toMatchObject({ configuredSources: ['superpowers.source'] });
    expect(getSupplyChainSourceStatus(config, 'superpowers.source').ok).toBe(true);
  });

  it('keeps configured source provenance after cloning the config object', async () => {
    const config = await loadSupplyChainConfig(tmpDir, {
      BEACON_SUPERPOWERS_SOURCE: 'env/superpowers',
    });
    const clonedConfig = { ...config, superpowers: { ...config.superpowers } };

    expect(getSupplyChainSourceStatus(clonedConfig, 'superpowers.source').ok).toBe(true);
  });

  it('reports Superpowers source as configured when loaded from the environment', async () => {
    const config = await loadSupplyChainConfig(tmpDir, {
      BEACON_SUPERPOWERS_SOURCE: 'env/superpowers',
    });

    expect(getSupplyChainSourceStatus(config, 'superpowers.source').ok).toBe(true);
  });

  it('rejects when .beacon/config.yaml exists but cannot be read as a file', async () => {
    const configDirPath = path.join(tmpDir, '.beacon', 'config.yaml');
    await fs.mkdir(configDirPath, { recursive: true });

    await expect(loadSupplyChainConfig(tmpDir, {})).rejects.toThrow(
      `Unable to read Beacon supply chain config at ${configDirPath}`,
    );
  });
});
