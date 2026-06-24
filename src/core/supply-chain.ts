import { promises as fs } from 'fs';
import path from 'path';

export interface SupplyChainConfig {
  beacon: {
    packageName: string;
    registry: string | null;
    latestMetadataUrl: string | null;
  };
  openspec: {
    packageSpec: string;
    registry: string | null;
  };
  superpowers: {
    source: string;
  };
  codegraph: {
    packageSpec: string;
    registry: string | null;
  };
}

export interface SupplyChainSourceStatus {
  ok: boolean;
  fatal: boolean;
  message: string;
  hint: string;
}

export type SupplyChainSourceKey =
  | 'beacon.registry'
  | 'beacon.latestMetadataUrl'
  | 'openspec.registry'
  | 'superpowers.source'
  | 'codegraph.registry';

const DEFAULT_CONFIG: SupplyChainConfig = {
  beacon: { packageName: 'beacon', registry: null, latestMetadataUrl: null },
  openspec: { packageSpec: '@fission-ai/openspec@latest', registry: null },
  superpowers: { source: 'obra/superpowers' },
  codegraph: { packageSpec: '@colbymchenry/codegraph', registry: null },
};

const CONFIG_KEYS = [
  'supply_chain.beacon.package',
  'supply_chain.beacon.registry',
  'supply_chain.beacon.latest_metadata_url',
  'supply_chain.openspec.package',
  'supply_chain.openspec.registry',
  'supply_chain.superpowers.source',
  'supply_chain.codegraph.package',
  'supply_chain.codegraph.registry',
] as const;

const MISSING_SOURCE_MESSAGES: Record<SupplyChainSourceKey, SupplyChainSourceStatus> = {
  'beacon.registry': {
    ok: false,
    fatal: false,
    message: 'Beacon npm registry is not configured; using npm default registry behavior.',
    hint: 'Set supply_chain.beacon.registry in .beacon/config.yaml or BEACON_NPM_REGISTRY.',
  },
  'beacon.latestMetadataUrl': {
    ok: false,
    fatal: false,
    message: 'Beacon latest metadata source is not configured; skipping private version check.',
    hint: 'Set supply_chain.beacon.latest_metadata_url in .beacon/config.yaml or BEACON_LATEST_METADATA_URL.',
  },
  'openspec.registry': {
    ok: false,
    fatal: false,
    message: 'OpenSpec npm registry is not configured; using npm default registry behavior.',
    hint: 'Set supply_chain.openspec.registry in .beacon/config.yaml or BEACON_OPENSPEC_REGISTRY.',
  },
  'superpowers.source': {
    ok: false,
    fatal: false,
    message: 'Superpowers skill source is not configured; skipping private skill source override.',
    hint: 'Set supply_chain.superpowers.source in .beacon/config.yaml or BEACON_SUPERPOWERS_SOURCE.',
  },
  'codegraph.registry': {
    ok: false,
    fatal: false,
    message: 'CodeGraph npm registry is not configured; using npm default registry behavior.',
    hint: 'Set supply_chain.codegraph.registry in .beacon/config.yaml or BEACON_CODEGRAPH_REGISTRY.',
  },
};

function cloneDefaultConfig(): SupplyChainConfig {
  return {
    beacon: { ...DEFAULT_CONFIG.beacon },
    openspec: { ...DEFAULT_CONFIG.openspec },
    superpowers: { ...DEFAULT_CONFIG.superpowers },
    codegraph: { ...DEFAULT_CONFIG.codegraph },
  };
}

function readFlatYamlValue(content: string, key: string): string | undefined {
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^([^:]+):\s*(.*)$/);
    if (!match || match[1].trim() !== key) continue;

    const raw = match[2].trim();
    if (!raw || raw === 'null') return undefined;
    return raw.replace(/^['"]|['"]$/g, '');
  }

  return undefined;
}

function applyValue(config: SupplyChainConfig, key: string, value: string | undefined): void {
  if (!value) return;

  if (key === 'supply_chain.beacon.package') config.beacon.packageName = value;
  if (key === 'supply_chain.beacon.registry') config.beacon.registry = value;
  if (key === 'supply_chain.beacon.latest_metadata_url') config.beacon.latestMetadataUrl = value;
  if (key === 'supply_chain.openspec.package') config.openspec.packageSpec = value;
  if (key === 'supply_chain.openspec.registry') config.openspec.registry = value;
  if (key === 'supply_chain.superpowers.source') config.superpowers.source = value;
  if (key === 'supply_chain.codegraph.package') config.codegraph.packageSpec = value;
  if (key === 'supply_chain.codegraph.registry') config.codegraph.registry = value;
}

function hasConfiguredSource(config: SupplyChainConfig, key: SupplyChainSourceKey): boolean {
  if (key === 'beacon.registry') return Boolean(config.beacon.registry);
  if (key === 'beacon.latestMetadataUrl') return Boolean(config.beacon.latestMetadataUrl);
  if (key === 'openspec.registry') return Boolean(config.openspec.registry);
  if (key === 'superpowers.source') return Boolean(config.superpowers.source);
  return Boolean(config.codegraph.registry);
}

/**
 * 读取项目级供应链配置，并让环境变量覆盖 `.beacon/config.yaml` 中的同名来源。
 */
export async function loadSupplyChainConfig(
  projectPath: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<SupplyChainConfig> {
  const config = cloneDefaultConfig();
  const configPath = path.join(projectPath, '.beacon', 'config.yaml');

  try {
    const content = await fs.readFile(configPath, 'utf-8');
    for (const key of CONFIG_KEYS) {
      applyValue(config, key, readFlatYamlValue(content, key));
    }
  } catch {
    // Missing project config is valid; private-safe defaults apply.
  }

  if (env.BEACON_PACKAGE_NAME) config.beacon.packageName = env.BEACON_PACKAGE_NAME;
  if (env.BEACON_NPM_REGISTRY) config.beacon.registry = env.BEACON_NPM_REGISTRY;
  if (env.BEACON_LATEST_METADATA_URL)
    config.beacon.latestMetadataUrl = env.BEACON_LATEST_METADATA_URL;
  if (env.BEACON_OPENSPEC_PACKAGE) config.openspec.packageSpec = env.BEACON_OPENSPEC_PACKAGE;
  if (env.BEACON_OPENSPEC_REGISTRY) config.openspec.registry = env.BEACON_OPENSPEC_REGISTRY;
  if (env.BEACON_SUPERPOWERS_SOURCE) config.superpowers.source = env.BEACON_SUPERPOWERS_SOURCE;
  if (env.BEACON_CODEGRAPH_PACKAGE) config.codegraph.packageSpec = env.BEACON_CODEGRAPH_PACKAGE;
  if (env.BEACON_CODEGRAPH_REGISTRY) config.codegraph.registry = env.BEACON_CODEGRAPH_REGISTRY;

  return config;
}

/**
 * 在配置了 registry 时为 npm 参数追加 `--registry`，未配置时保持调用方参数不变。
 */
export function buildRegistryNpmArgs(args: string[], registry: string | null): string[] {
  return registry ? [...args, '--registry', registry] : [...args];
}

/**
 * 返回 Beacon latest-version 元数据 URL；未配置私有元数据源时返回 `null`。
 */
export function buildBeaconLatestMetadataUrl(config: SupplyChainConfig): string | null {
  return config.beacon.latestMetadataUrl;
}

/**
 * 将缺失私有来源表示为统一的非致命状态，供后续命令层展示或跳过对应动作。
 */
export function getSupplyChainSourceStatus(
  config: SupplyChainConfig,
  key: SupplyChainSourceKey,
): SupplyChainSourceStatus {
  if (!hasConfiguredSource(config, key)) {
    return { ...MISSING_SOURCE_MESSAGES[key] };
  }

  return {
    ok: true,
    fatal: false,
    message: 'Supply chain source is configured.',
    hint: '',
  };
}
