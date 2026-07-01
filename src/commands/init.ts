import os from 'os';
import path from 'path';
import { checkbox, select } from '@inquirer/prompts';

import {
  hasCodegraphProjectIndex,
  installCodegraph,
  resolveCodegraphCommand,
} from '../core/codegraph.js';
import { detectPlatforms, getBaseDir, hasSkills, type InstallScope } from '../core/detect.js';
import { installOpenSpec, isCommandAvailable } from '../core/openspec.js';
import { PLATFORMS, getPlatformSkillsDir, type Platform } from '../core/platforms.js';
import { buildBeaconLatestMetadataUrl, loadSupplyChainConfig } from '../core/supply-chain.js';
import { installSuperpowersForPlatforms } from '../core/superpowers.js';
import {
  copyBeaconRulesForPlatform,
  copyBeaconSkillsForPlatform,
  createWorkingDirs,
  installBeaconHooksForPlatform,
} from '../core/skills.js';
import { printVersionInfo } from '../core/version.js';
import { t, type TranslationKey } from './i18n.js';
import { platformSelectPrompt } from './platform-select-prompt.js';

type InitOptions = {
  yes?: boolean;
  skipExisting?: boolean;
  overwrite?: boolean;
  json?: boolean;
  scope?: InstallScope;
};

type InstallStatus = 'installed' | 'skipped' | 'failed';
type ComponentAction = 'overwrite' | 'skip' | 'install';
type BulkOverwriteChoice = 'overwrite-all' | 'skip-all' | 'choose';
type NpmDepId = 'openspec' | 'superpowers' | 'codegraph';

interface PlatformResult {
  platform: Platform;
  openspec: InstallStatus;
  superpowers: InstallStatus;
  beacon: InstallStatus;
  codegraph: InstallStatus;
}

interface NpmDepState {
  id: NpmDepId;
  installed: boolean;
}

type ComponentPlan = {
  osAction: ComponentAction;
  spAction: ComponentAction;
  cmAction: ComponentAction;
};

type PlatformPlan = ComponentPlan & {
  platform: Platform;
  hasOS: boolean;
  hasSP: boolean;
  hasCM: boolean;
};

const RUNTIME_SKILLS_DIR = 'skills-zh';

const BEACON_BANNER = [
  ' ____  _____    _    ____ ___  _   _ ',
  '| __ )| ____|  / \\  / ___/ _ \\| \\ | |',
  '|  _ \\|  _|   / _ \\| |  | | | |  \\| |',
  '| |_) | |___ / ___ \\ |__| |_| | |\\  |',
  '|____/|_____/_/   \\_\\____\\___/|_| \\_|',
  'Agent Skill Harness Phase-Guarded Automation',
  'From Idea To Archive',
].join('\n');

async function selectScope(options: InitOptions, lang: string): Promise<InstallScope> {
  if (options.scope) return options.scope;
  if (options.yes) return 'project';

  return select({
    message: t(lang, 'installScope'),
    choices: [
      { name: t(lang, 'scopeProject'), value: 'project' as const },
      { name: t(lang, 'scopeGlobal'), value: 'global' as const },
    ],
  });
}

async function selectPlatforms(
  detected: Set<string>,
  options: InitOptions,
  lang: string,
): Promise<string[]> {
  const choices = PLATFORMS.map((platform) => ({
    name: `${platform.name}${detected.has(platform.id) ? ` (${t(lang, 'detected')})` : ''}`,
    summaryName: platform.name,
    value: platform.id,
    checked: detected.has(platform.id),
  }));

  if (options.yes) {
    const selected = [...detected];
    return selected.length > 0 ? selected : PLATFORMS.map((platform) => platform.id);
  }

  return platformSelectPrompt({
    message: t(lang, 'selectPlatforms'),
    choices,
    selectedLabel: t(lang, 'selectedPlatforms'),
    emptyLabel: t(lang, 'noneSelected'),
    required: true,
    requiredErrorLabel: t(lang, 'selectPlatformsRequired'),
  });
}

async function promptOverwriteChoice(
  componentName: string,
  platformName: string,
  lang: string,
): Promise<'overwrite' | 'skip'> {
  return select({
    message: `${componentName} ${t(lang, 'alreadyExists')} ${platformName}. ${t(lang, 'overwriteChoice')}`,
    choices: [
      { name: t(lang, 'overwrite'), value: 'overwrite' as const },
      { name: t(lang, 'skip'), value: 'skip' as const },
    ],
  });
}

async function promptBulkOverwriteChoice(
  platformName: string,
  components: string[],
  lang: string,
): Promise<BulkOverwriteChoice> {
  return select({
    message: `${platformName} ${t(lang, 'bulkOverwrite')} ${components.join(', ')}. ${t(lang, 'overwriteChoice')}`,
    choices: [
      { name: t(lang, 'overwriteAll'), value: 'overwrite-all' as const },
      { name: t(lang, 'skipAll'), value: 'skip-all' as const },
      { name: t(lang, 'choosePer'), value: 'choose' as const },
    ],
  });
}

function applyBulkOverwriteChoice<T extends ComponentPlan>(
  plan: T,
  choice: Exclude<BulkOverwriteChoice, 'choose'>,
  hasExisting?: { os?: boolean; sp?: boolean; cm?: boolean },
): T {
  const action = choice === 'overwrite-all' ? 'overwrite' : 'skip';
  const shouldApply = (actionState: ComponentAction, exists?: boolean) =>
    actionState === 'install' && (hasExisting === undefined || exists === true);

  return {
    ...plan,
    osAction: shouldApply(plan.osAction, hasExisting?.os) ? action : plan.osAction,
    spAction: shouldApply(plan.spAction, hasExisting?.sp) ? action : plan.spAction,
    cmAction: shouldApply(plan.cmAction, hasExisting?.cm) ? action : plan.cmAction,
  };
}

function resolveAction(
  hasExisting: boolean,
  options: InitOptions,
): 'overwrite' | 'skip' | 'install' {
  if (!hasExisting) return 'install';
  if (options.overwrite) return 'overwrite';
  if (options.skipExisting) return 'skip';
  if (options.yes) return 'skip';
  return 'install';
}

async function selectNpmDeps(
  projectPath: string,
  spPlatformIds: string[],
  options: InitOptions,
  lang: string,
): Promise<Set<NpmDepId>> {
  const openSpecInstalled = isCommandAvailable('openspec');
  const codegraphInstalled =
    hasCodegraphProjectIndex(projectPath) || resolveCodegraphCommand() !== null;
  const superpowersInstalled = spPlatformIds.length === 0 ? true : undefined;

  const states: NpmDepState[] = [
    { id: 'openspec', installed: openSpecInstalled },
    { id: 'superpowers', installed: Boolean(superpowersInstalled) },
    { id: 'codegraph', installed: codegraphInstalled },
  ];

  const depLabel: Record<NpmDepId, (installed: boolean) => string> = {
    openspec: (installed) =>
      installed ? t(lang, 'npmDepOpenSpecInstalled') : t(lang, 'npmDepOpenSpec'),
    superpowers: (installed) =>
      installed ? t(lang, 'npmDepSuperpowersInstalled') : t(lang, 'npmDepSuperpowers'),
    codegraph: (installed) =>
      installed ? t(lang, 'npmDepCodegraphInstalled') : t(lang, 'npmDepCodegraph'),
  };

  const depHint: Partial<Record<NpmDepId, string>> = {
    superpowers: t(lang, 'npmDepSuperpowersHint'),
  };

  const choices = states.map(({ id, installed }) => {
    const choice: {
      name: string;
      value: NpmDepId;
      checked: boolean;
      description?: string;
    } = {
      name: depLabel[id](installed),
      value: id,
      checked: !installed,
    };
    if (depHint[id]) {
      choice.description = depHint[id];
    }
    return choice;
  });

  if (options.yes) {
    return new Set(states.filter((state) => !state.installed).map((state) => state.id));
  }

  const selected = await checkbox({
    message: t(lang, 'selectNpmDeps'),
    choices,
  });
  return new Set(selected as NpmDepId[]);
}

function displaySummary(results: PlatformResult[], scope: InstallScope, lang: string): void {
  const scopeLabel = scope === 'global' ? os.homedir() : 'project';

  console.log(`\n  ${t(lang, 'setupComplete')} (scope: ${scopeLabel})\n`);

  const installed = results.filter(
    (result) =>
      result.openspec === 'installed' ||
      result.superpowers === 'installed' ||
      result.beacon === 'installed' ||
      result.codegraph === 'installed',
  );
  const skipped = results.filter(
    (result) =>
      result.openspec === 'skipped' &&
      result.superpowers === 'skipped' &&
      result.beacon === 'skipped' &&
      result.codegraph === 'skipped',
  );
  const failed = results.filter(
    (result) =>
      result.openspec === 'failed' ||
      result.superpowers === 'failed' ||
      result.beacon === 'failed' ||
      result.codegraph === 'failed',
  );

  if (installed.length > 0) {
    console.log(`  ${t(lang, 'installed')}`);
    for (const result of installed) {
      console.log(
        `    ${result.platform.name} -> ${getPlatformSkillsDir(result.platform, scope)}/skills/`,
      );
    }
  }
  if (skipped.length > 0) {
    console.log(
      `  ${t(lang, 'skippedLabel')} ${skipped.map((result) => result.platform.name).join(', ')}`,
    );
  }
  if (failed.length > 0) {
    console.log(
      `  ${t(lang, 'failedLabel')} ${failed.map((result) => result.platform.name).join(', ')}`,
    );
  }

  if (scope === 'project') {
    console.log(`\n  ${t(lang, 'workingDirs')}`);
  }

  console.log(`\n  ${t(lang, 'getStarted')}`);
  console.log(`    ${t(lang, 'getStartedBeacon')}`);
  console.log(`    ${t(lang, 'getStartedHotfix')}`);
  console.log(`    ${t(lang, 'getStartedTweak')}\n`);
}

export async function initCommand(targetPath: string, options: InitOptions = {}): Promise<void> {
  const projectPath = path.resolve(targetPath);
  const lang = 'zh';
  const log = options.json ? () => undefined : console.log;
  const supplyChain = await loadSupplyChainConfig(projectPath);

  log(`\n${BEACON_BANNER}\n`);
  if (!options.json) {
    await printVersionInfo(log, buildBeaconLatestMetadataUrl(supplyChain));
  }

  log(`  ${t(lang, 'settingUp')} ${projectPath}\n`);

  const detected = await detectPlatforms(projectPath);
  const scope = await selectScope(options, lang);
  const selectedPlatformIds = await selectPlatforms(detected, options, lang);

  if (selectedPlatformIds.length === 0) {
    if (options.json) {
      console.log(
        JSON.stringify(
          {
            projectPath,
            scope,
            selectedPlatforms: [],
            results: [],
          },
          null,
          2,
        ),
      );
      return;
    }
    log(`\n  ${t(lang, 'noPlatforms')}\n`);
    return;
  }

  const selectedPlatforms = PLATFORMS.filter((platform) =>
    selectedPlatformIds.includes(platform.id),
  );
  const baseDir = getBaseDir(scope, projectPath);
  const plans: PlatformPlan[] = [];

  for (const platform of selectedPlatforms) {
    const hasOS = await hasSkills(baseDir, platform, 'openspec', selectedPlatforms, scope);
    const hasSP = await hasSkills(baseDir, platform, 'superpowers', selectedPlatforms, scope);
    const hasCM = await hasSkills(baseDir, platform, 'beacon', selectedPlatforms, scope);

    let osAction = resolveAction(hasOS, options);
    let spAction = resolveAction(hasSP, options);
    let cmAction = resolveAction(hasCM, options);

    if (!options.yes) {
      const existingComponents = [
        hasOS && osAction === 'install' ? 'OpenSpec' : null,
        hasSP && spAction === 'install' ? 'Superpowers' : null,
        hasCM && cmAction === 'install' ? 'Beacon' : null,
      ].filter((component): component is string => Boolean(component));

      if (existingComponents.length > 1) {
        const bulkChoice = await promptBulkOverwriteChoice(platform.name, existingComponents, lang);
        if (bulkChoice !== 'choose') {
          ({ osAction, spAction, cmAction } = applyBulkOverwriteChoice(
            { osAction, spAction, cmAction },
            bulkChoice,
            { os: hasOS, sp: hasSP, cm: hasCM },
          ));
        }
      }

      if (osAction === 'install' && hasOS) {
        osAction = await promptOverwriteChoice('OpenSpec', platform.name, lang);
      }
      if (spAction === 'install' && hasSP) {
        spAction = await promptOverwriteChoice('Superpowers', platform.name, lang);
      }
      if (cmAction === 'install' && hasCM) {
        cmAction = await promptOverwriteChoice('Beacon', platform.name, lang);
      }
    }

    plans.push({ platform, osAction, spAction, cmAction, hasOS, hasSP, hasCM });
  }

  const osToolIds = plans
    .filter((plan) => plan.osAction !== 'skip')
    .map((plan) => plan.platform.openspecToolId);
  const spPlatformIds = plans
    .filter((plan) => plan.spAction !== 'skip')
    .map((plan) => plan.platform.id);

  const selectedNpmDeps = await selectNpmDeps(projectPath, spPlatformIds, options, lang);
  const shouldInstallOpenSpecCli = selectedNpmDeps.has('openspec');
  const shouldInstallSuperpowers = selectedNpmDeps.has('superpowers');
  const shouldInstallCodegraphCli = selectedNpmDeps.has('codegraph');

  let osGlobalStatus: InstallStatus = 'skipped';
  if (osToolIds.length > 0) {
    log(`\n  ${t(lang, 'installingOS')} ${osToolIds.join(', ')}`);
    osGlobalStatus = await installOpenSpec(
      projectPath,
      osToolIds,
      scope,
      shouldInstallOpenSpecCli,
      supplyChain.openspec,
    );
    if (osGlobalStatus === 'skipped' && !shouldInstallOpenSpecCli) {
      log(`  OpenSpec: ${t(lang, 'osSkippedNoCli')}`);
    } else {
      log(`  OpenSpec: ${osGlobalStatus}`);
    }
  } else {
    log(`\n  OpenSpec: ${t(lang, 'allSkipped')}`);
  }

  let spGlobalStatus: InstallStatus = 'skipped';
  if (spPlatformIds.length > 0) {
    if (!shouldInstallSuperpowers) {
      log(`\n  Superpowers: ${t(lang, 'spSkippedByUser')}`);
    } else {
      log(`\n  ${t(lang, 'installingSP')} ${spPlatformIds.join(', ')}`);
      spGlobalStatus = await installSuperpowersForPlatforms(
        projectPath,
        scope,
        spPlatformIds,
        true,
        supplyChain.superpowers.source,
      );
      log(`  Superpowers: ${spGlobalStatus}`);
    }
  } else {
    log(`\n  Superpowers: ${t(lang, 'allSkipped')}`);
  }

  const results: PlatformResult[] = [];
  for (const plan of plans) {
    const platformSkillsDir = getPlatformSkillsDir(plan.platform, scope);
    const skillsPath = `${scope === 'global' ? '~/' : ''}${platformSkillsDir}/skills/`;

    let cmStatus: InstallStatus = 'skipped';
    if (plan.cmAction !== 'skip') {
      const { copied } = await copyBeaconSkillsForPlatform(
        baseDir,
        plan.platform,
        plan.cmAction === 'overwrite',
        RUNTIME_SKILLS_DIR,
        scope,
      );
      cmStatus = copied > 0 ? 'installed' : 'skipped';
      log(`  Beacon -> ${plan.platform.name}: ${cmStatus} (${copied} files) -> ${skillsPath}`);
    } else {
      log(`  Beacon -> ${plan.platform.name}: skipped (${t(lang, 'alreadyExists')})`);
    }

    if (plan.cmAction !== 'skip') {
      const { copied: ruleCopied } = await copyBeaconRulesForPlatform(
        baseDir,
        plan.platform,
        plan.cmAction === 'overwrite',
        scope,
      );
      if (ruleCopied > 0) {
        log(`  Beacon rules -> ${plan.platform.name}: ${ruleCopied} ${t(lang, 'rulesInstalled')}`);
      }
    }

    if (plan.cmAction !== 'skip' && plan.platform.supportsHooks) {
      const { installed, reason } = await installBeaconHooksForPlatform(
        baseDir,
        plan.platform,
        scope,
      );
      if (installed) {
        log(`  Beacon hooks -> ${plan.platform.name}: ${t(lang, 'hooksInstalled')}`);
      } else if (reason) {
        log(`  Beacon hooks -> ${plan.platform.name}: ${t(lang, 'hooksSkipped')} (${reason})`);
      }
    }

    results.push({
      platform: plan.platform,
      openspec: osToolIds.includes(plan.platform.openspecToolId) ? osGlobalStatus : 'skipped',
      superpowers: plan.spAction !== 'skip' ? spGlobalStatus : 'skipped',
      beacon: cmStatus,
      codegraph: 'skipped',
    });
  }

  const codegraphAlreadyIndexed = hasCodegraphProjectIndex(projectPath);
  const shouldInstallCodegraph =
    !options.json && !codegraphAlreadyIndexed && shouldInstallCodegraphCli;

  if (shouldInstallCodegraph) {
    log(`\n  ${t(lang, 'installingCG')}`);
    const cgGlobalStatus = await installCodegraph(projectPath, scope, true, supplyChain.codegraph);
    log(`  CodeGraph: ${cgGlobalStatus}`);
    for (const result of results) {
      result.codegraph = cgGlobalStatus;
    }
  } else if (!options.json && codegraphAlreadyIndexed) {
    log('\n  CodeGraph: skipped (existing .codegraph index detected)');
  } else if (!options.json) {
    log(`\n  CodeGraph: ${t(lang, 'cgSkippedByUser')}`);
  }

  if (scope === 'project') {
    await createWorkingDirs(projectPath);
  }

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          projectPath,
          scope,
          selectedPlatforms: selectedPlatformIds,
          results: results.map((result) => ({
            platform: result.platform.id,
            platformName: result.platform.name,
            openspec: result.openspec,
            superpowers: result.superpowers,
            beacon: result.beacon,
            codegraph: result.codegraph,
          })),
          workingDirsCreated: scope === 'project',
        },
        null,
        2,
      ),
    );
    return;
  }

  displaySummary(results, scope, lang);
}

export { applyBulkOverwriteChoice };
export type { TranslationKey };
