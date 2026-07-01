import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { select } from '@inquirer/prompts';

import { hasCodegraphProjectIndex, installCodegraph } from '../core/codegraph.js';
import { getBaseDir } from '../core/detect.js';
import { PLATFORMS, getPlatformSkillsDir, type Platform } from '../core/platforms.js';
import {
  buildBeaconLatestMetadataUrl,
  buildRegistryNpmArgs,
  loadSupplyChainConfig,
  type SupplyChainConfig,
} from '../core/supply-chain.js';
import {
  copyBeaconRulesForPlatform,
  copyBeaconSkillsForPlatform,
  getManifestSkills,
  installBeaconHooksForPlatform,
} from '../core/skills.js';
import type { InstallScope } from '../core/types.js';
import { printVersionInfo } from '../core/version.js';
import { fileExists, readDir, readJson } from '../utils/file-system.js';
import { t, type TranslationKey } from './i18n.js';

const DEFAULT_PACKAGE_NAME = 'beacon';
const RUNTIME_SKILLS_DIR = 'skills-zh';

interface UpdateOptions {
  json?: boolean;
  scope?: InstallScope;
  skipNpm?: boolean;
}

type SkillLanguage = 'en' | 'zh';

interface InstalledBeaconTarget {
  scope: InstallScope;
  platform: Platform;
  language: SkillLanguage;
}

interface DetectTargetsOptions {
  scopes?: InstallScope[];
  globalBaseDir?: string;
}

interface DetectBeaconPackageScopeOptions {
  packageName?: string;
  packageRoot?: string;
}

function getScopedBaseDir(
  scope: InstallScope,
  projectPath: string,
  globalBaseDir = os.homedir(),
): string {
  return scope === 'global' ? globalBaseDir : projectPath;
}

function getInstalledBeaconSkillsDirs(
  baseDir: string,
  platform: Platform,
  scope: InstallScope = 'project',
): string[] {
  const dirs = [path.join(baseDir, getPlatformSkillsDir(platform, scope), 'skills')];
  if (scope === 'global' && platform.id === 'pi') {
    dirs.push(path.join(baseDir, platform.skillsDir, 'skills'));
  }
  return [...new Set(dirs)];
}

async function hasLocalBeaconSkills(
  baseDir: string,
  platform: Platform,
  scope: InstallScope,
): Promise<boolean> {
  for (const skillsDir of getInstalledBeaconSkillsDirs(baseDir, platform, scope)) {
    if (!(await fileExists(skillsDir))) continue;
    const entries = await readDir(skillsDir);
    if (entries.some((entry) => entry.startsWith('beacon'))) return true;
  }
  return false;
}

async function detectInstalledBeaconLanguage(
  baseDir: string,
  platform: Platform,
  scope: InstallScope = 'project',
): Promise<SkillLanguage> {
  for (const skillsDir of getInstalledBeaconSkillsDirs(baseDir, platform, scope)) {
    if (!(await fileExists(skillsDir))) continue;
    const entries = (await readDir(skillsDir)).filter((entry) => entry.startsWith('beacon'));

    for (const entry of entries) {
      const skillPath = path.join(skillsDir, entry, 'SKILL.md');
      if (!(await fileExists(skillPath))) continue;

      try {
        const content = await fs.readFile(skillPath, 'utf-8');
        if (/[一-龥]/u.test(content)) return 'zh';
      } catch {
        // Ignore unreadable files and fall back to the default.
      }
    }
  }

  return 'en';
}

async function detectInstalledBeaconTargets(
  projectPath: string,
  options: DetectTargetsOptions = {},
): Promise<InstalledBeaconTarget[]> {
  const scopes = options.scopes ?? (['project', 'global'] as InstallScope[]);
  const targets: InstalledBeaconTarget[] = [];

  for (const scope of scopes) {
    const baseDir = getScopedBaseDir(scope, projectPath, options.globalBaseDir);

    for (const platform of PLATFORMS) {
      if (!(await hasLocalBeaconSkills(baseDir, platform, scope))) continue;

      targets.push({
        scope,
        platform,
        language: await detectInstalledBeaconLanguage(baseDir, platform, scope),
      });
    }
  }

  return targets;
}

function isSameOrInside(childPath: string, parentPath: string): boolean {
  const relative = path.relative(path.resolve(parentPath), path.resolve(childPath));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

async function detectBeaconPackageScope(
  projectPath: string,
  options: DetectBeaconPackageScopeOptions | string = {},
): Promise<InstallScope> {
  const packageName =
    typeof options === 'string'
      ? DEFAULT_PACKAGE_NAME
      : (options.packageName ?? DEFAULT_PACKAGE_NAME);
  const packageRoot =
    typeof options === 'string'
      ? options
      : (options.packageRoot ??
        path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..'));
  const localPackageRoot = path.join(projectPath, 'node_modules', packageName);
  if (isSameOrInside(packageRoot, localPackageRoot)) return 'project';

  const packageJsonPath = path.join(projectPath, 'package.json');
  if (await fileExists(packageJsonPath)) {
    const pkg = await readJson<{
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      optionalDependencies?: Record<string, string>;
    }>(packageJsonPath);

    if (
      pkg.dependencies?.[packageName] ||
      pkg.devDependencies?.[packageName] ||
      pkg.optionalDependencies?.[packageName]
    ) {
      return 'project';
    }
  }

  return 'global';
}

function buildNpmUpdateArgs(
  scope: InstallScope,
  beaconSource: Pick<SupplyChainConfig['beacon'], 'packageName' | 'registry'>,
): string[] {
  const packageSpec = `${beaconSource.packageName}@latest`;
  const args = scope === 'global' ? ['install', '-g', packageSpec] : ['install', packageSpec];
  return buildRegistryNpmArgs(args, beaconSource.registry);
}

function formatNpmUpdateCommand(
  scope: InstallScope,
  beaconSource: Pick<SupplyChainConfig['beacon'], 'packageName' | 'registry'>,
): string {
  return ['npm', ...buildNpmUpdateArgs(scope, beaconSource)].join(' ');
}

function formatSkillUpdateCommand(scope: InstallScope, platform: Platform): string {
  const destPrefix = scope === 'global' ? '~/' : '';
  return `copy assets/${RUNTIME_SKILLS_DIR} -> ${destPrefix}${getPlatformSkillsDir(platform, scope)}/skills/ (${scope})`;
}

function getNpmExecutable(): string {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

async function updateBeaconNpmPackage(
  scope: InstallScope,
  projectPath: string,
  beaconSource: Pick<SupplyChainConfig['beacon'], 'packageName' | 'registry'>,
  log: (message: string) => void,
  jsonMode = false,
): Promise<boolean> {
  const args = buildNpmUpdateArgs(scope, beaconSource);
  const cwd = scope === 'global' ? process.cwd() : projectPath;

  return new Promise((resolve) => {
    const child = spawn(getNpmExecutable(), args, {
      cwd,
      stdio: jsonMode ? 'ignore' : 'inherit',
      shell: true,
    });
    child.on('error', (err) => {
      log(`  npm package: failed to launch npm - ${err.message}`);
      resolve(false);
    });
    child.on('exit', (code) => {
      if (code !== 0) {
        const source = beaconSource.registry
          ? `registry at ${beaconSource.registry}`
          : 'the configured npm default registry';
        log(
          `  npm package: update failed (exit code ${code}). Unable to update ${beaconSource.packageName} from ${source}.`,
        );
        log('  Check your network connection or firewall settings and try again.');
      }
      resolve(code === 0);
    });
  });
}

async function promptCodegraphInstall(lang: string): Promise<boolean> {
  return select({
    message: t(lang, 'installCodegraph'),
    choices: [
      { name: t(lang, 'codegraphYes'), value: true },
      { name: t(lang, 'codegraphNo'), value: false },
    ],
  });
}

export async function updateCommand(
  targetPath: string,
  options: UpdateOptions = {},
): Promise<void> {
  const projectPath = path.resolve(targetPath);
  const lang = 'zh';
  const log = options.json ? () => undefined : console.log;
  const supplyChain = await loadSupplyChainConfig(projectPath);

  log(`\n  ${t(lang, 'updateTitle')}`);
  if (!options.json) {
    await printVersionInfo(log, buildBeaconLatestMetadataUrl(supplyChain));
  }
  log('');

  const packageScope =
    options.scope ??
    (await detectBeaconPackageScope(projectPath, { packageName: supplyChain.beacon.packageName }));
  let npmStatus: 'updated' | 'failed' | 'skipped' = 'skipped';
  if (!options.skipNpm) {
    log(`  ${t(lang, 'updatingNpmPackage')} (${packageScope} scope)...`);
    log(`    $ ${formatNpmUpdateCommand(packageScope, supplyChain.beacon)}`);
    const npmUpdated = await updateBeaconNpmPackage(
      packageScope,
      projectPath,
      supplyChain.beacon,
      log,
      options.json === true,
    );
    if (npmUpdated) {
      npmStatus = 'updated';
      log(`  ${t(lang, 'npmPackageUpdated')} ${supplyChain.beacon.packageName}`);
    } else {
      npmStatus = 'failed';
      log(`  ${t(lang, 'npmPackageFailed')}`);
    }
  }

  const targets = await detectInstalledBeaconTargets(projectPath, {
    scopes: options.scope ? [options.scope] : undefined,
  });

  if (targets.length === 0) {
    if (options.json) {
      console.log(
        JSON.stringify(
          {
            npm: {
              scope: options.skipNpm ? 'skipped' : packageScope,
              status: npmStatus,
              command: options.skipNpm
                ? null
                : formatNpmUpdateCommand(packageScope, supplyChain.beacon),
            },
            skills: { totalCopied: 0, targets: [] },
            rules: { totalCopied: 0 },
            hooks: { totalInstalled: 0 },
            codegraph: 'skipped',
          },
          null,
          2,
        ),
      );
      return;
    }
    log(`\n  ${t(lang, 'noInstallsFound')}\n`);
    return;
  }

  log(`\n  ${t(lang, 'updatingSkillsOnTargets')} ${targets.length} target(s):`);
  for (const target of targets) {
    const scopeLabel = target.scope === 'global' ? 'global' : `project (${projectPath})`;
    log(`    - ${target.platform.name} (${scopeLabel})`);
    log(`      $ ${formatSkillUpdateCommand(target.scope, target.platform)}`);
  }

  log(
    `\n  ${t(lang, 'copyingSkillsFiles')} ${(await getManifestSkills()).length} skill files...\n`,
  );

  let totalCopied = 0;
  let totalRulesCopied = 0;
  let totalHooksInstalled = 0;
  const targetResults = [];

  for (const target of targets) {
    const baseDir = getBaseDir(target.scope, projectPath);
    const { copied, skipped } = await copyBeaconSkillsForPlatform(
      baseDir,
      target.platform,
      true,
      RUNTIME_SKILLS_DIR,
      target.scope,
    );
    totalCopied += copied;
    targetResults.push({
      scope: target.scope,
      platform: target.platform.id,
      platformName: target.platform.name,
      source: RUNTIME_SKILLS_DIR,
      copied,
      skipped,
      command: formatSkillUpdateCommand(target.scope, target.platform),
    });
    log(
      `  ${target.platform.name} (${target.scope}, ${RUNTIME_SKILLS_DIR}): ${copied} ${t(lang, 'skillsCopiedSkipped')} ${skipped} skipped`,
    );

    try {
      const { copied: ruleCopied } = await copyBeaconRulesForPlatform(
        baseDir,
        target.platform,
        true,
        target.scope,
      );
      totalRulesCopied += ruleCopied;
      if (ruleCopied > 0) {
        log(`  Beacon rules -> ${target.platform.name}: ${ruleCopied} ${t(lang, 'rulesUpdated')}`);
      }
    } catch (err) {
      log(
        `  Beacon rules -> ${target.platform.name}: ${t(lang, 'rulesFailed')} (${(err as Error).message})`,
      );
    }

    if (target.platform.supportsHooks) {
      try {
        const { installed, reason } = await installBeaconHooksForPlatform(
          baseDir,
          target.platform,
          target.scope,
        );
        if (installed) {
          totalHooksInstalled++;
          log(`  Beacon hooks -> ${target.platform.name}: ${t(lang, 'hooksUpdated')}`);
        } else if (reason) {
          log(`  Beacon hooks -> ${target.platform.name}: ${t(lang, 'hooksSkipped')} (${reason})`);
        }
      } catch (err) {
        log(
          `  Beacon hooks -> ${target.platform.name}: ${t(lang, 'hooksFailed')} (${(err as Error).message})`,
        );
      }
    }
  }

  let codegraphStatus: 'installed' | 'failed' | 'skipped' = 'skipped';
  const primaryScope = targets[0]?.scope ?? 'project';
  const codegraphAlreadyIndexed = hasCodegraphProjectIndex(projectPath);

  if (options.json) {
    codegraphStatus = 'skipped';
  } else if (codegraphAlreadyIndexed) {
    log('\n  CodeGraph: skipped (existing .codegraph index detected)');
  } else {
    const shouldInstallCodegraph = options.skipNpm ? false : await promptCodegraphInstall(lang);

    if (shouldInstallCodegraph) {
      log(`\n  ${t(lang, 'installingCG')}`);
      codegraphStatus = await installCodegraph(
        projectPath,
        primaryScope,
        true,
        supplyChain.codegraph,
      );
      log(`  CodeGraph: ${codegraphStatus}`);
    } else {
      log(`\n  CodeGraph: ${t(lang, 'cgSkippedByUser')}`);
    }
  }

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          npm: {
            scope: options.skipNpm ? 'skipped' : packageScope,
            status: npmStatus,
            command: options.skipNpm
              ? null
              : formatNpmUpdateCommand(packageScope, supplyChain.beacon),
          },
          skills: {
            totalCopied,
            targets: targetResults,
          },
          rules: { totalCopied: totalRulesCopied },
          hooks: { totalInstalled: totalHooksInstalled },
          codegraph: codegraphStatus,
        },
        null,
        2,
      ),
    );
    return;
  }

  const scopes = [...new Set(targetResults.map((target) => target.scope))].join(', ');
  log(`\n  ${t(lang, 'summary')}`);
  log(`    ${t(lang, 'summaryNpm')} ${npmStatus}${options.skipNpm ? '' : ` (${packageScope})`}`);
  log(`    ${t(lang, 'summarySkills')} ${targets.length} target(s), ${totalCopied} files updated`);
  log(`    ${t(lang, 'summaryCodegraph')} ${codegraphStatus}`);
  log(`    ${t(lang, 'summaryScope')} ${scopes}`);
  log(`\n  ${t(lang, 'updateComplete')}\n`);
}

export {
  buildNpmUpdateArgs,
  detectBeaconPackageScope,
  detectInstalledBeaconLanguage,
  detectInstalledBeaconTargets,
  formatNpmUpdateCommand,
  formatSkillUpdateCommand,
};
export type { InstalledBeaconTarget, SkillLanguage, TranslationKey };
