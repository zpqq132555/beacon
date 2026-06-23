import { describe, expect, it } from 'vitest';
import { promises as fs } from 'fs';

describe('README assets', () => {
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
});
