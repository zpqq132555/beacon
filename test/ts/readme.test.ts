import { describe, expect, it } from 'vitest';
import { promises as fs } from 'fs';
import { t } from '../../src/commands/i18n.js';

describe('README assets', () => {
  const publicBeaconInstall = `npm install -g ${'beacon'}`;
  const publicBeaconLatestInstall = `npm install -g ${'beacon'}@latest`;
  const publicBeaconSkillSource = `npx skills add ${'rpamis/beacon'}`;
  const formerKimiMatrix = `第 ${29} 个支持平台`;
  const formerUninstallMatrix = `覆盖 ${29} 个平台`;
  const formerCodegraphMatrix = `自动检测 ${7} 个支持平台`;
  const publicRegistryDefault = `强制走${'官方源'}`;
  const publicLatestVersionNarrative = `npm registry 是否有${'新版本'}`;

  it('uses npm-friendly absolute image URLs in README.md', async () => {
    const content = await fs.readFile('README.md', 'utf-8');

    expect(content).not.toMatch(/\b(?:src|srcset)=["'](?:\.\/)?img\//);
    expect(content).toContain('https://github.com/rpamis/beacon/blob/master/img/');
  });

  it('documents build_pause in README state examples and field descriptions', async () => {
    const content = await fs.readFile('README.md', 'utf-8');

    expect(content).toContain('build_pause: null');
    expect(content).toContain('`build_pause` 记录 build 阶段内部暂停点');
    expect(content).toContain('`plan-ready` 表示 plan 已生成');
  });

  it('keeps current supply chain documentation private-source aware', async () => {
    const readme = await fs.readFile('README.md', 'utf-8');
    const news = await fs.readFile('NEWS.md', 'utf-8');

    expect(readme).toContain('Beacon 供应链配置');
    expect(readme).not.toContain(`${publicBeaconInstall}\n`);
    expect(readme).not.toContain(publicBeaconLatestInstall);
    expect(readme).not.toContain(publicBeaconSkillSource);

    expect(news).not.toContain(formerKimiMatrix);
    expect(news).not.toContain(formerUninstallMatrix);
    expect(news).not.toContain(formerCodegraphMatrix);
    expect(news).not.toContain(publicRegistryDefault);
    expect(news).not.toContain(publicLatestVersionNarrative);
  });

  it('labels optional dependency sources as supply chain configured', () => {
    expect(t('en', 'npmDepOpenSpec')).toBe(
      'OpenSpec CLI (source from Beacon supply chain config)',
    );
    expect(t('en', 'npmDepSuperpowers')).toBe(
      'Superpowers skills (source from Beacon supply chain config)',
    );
    expect(t('en', 'npmDepCodegraph')).toBe(
      'CodeGraph CLI (source from Beacon supply chain config)',
    );

    expect(t('zh', 'npmDepOpenSpec')).toBe('OpenSpec CLI（来源取自 Beacon 供应链配置）');
    expect(t('zh', 'npmDepSuperpowers')).toBe(
      'Superpowers 技能（来源取自 Beacon 供应链配置）',
    );
    expect(t('zh', 'npmDepCodegraph')).toBe('CodeGraph CLI（来源取自 Beacon 供应链配置）');
  });
});
