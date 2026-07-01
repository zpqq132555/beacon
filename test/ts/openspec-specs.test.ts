import { promises as fs } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const specsRoot = path.resolve('openspec', 'specs');

async function collectSpecFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return collectSpecFiles(fullPath);
      if (entry.isFile() && entry.name === 'spec.md') return [fullPath];
      return [];
    }),
  );
  return nested.flat();
}

describe('canonical OpenSpec specs', () => {
  it('do not keep archive placeholder Purpose text in main specs', async () => {
    const specFiles = await collectSpecFiles(specsRoot);
    const disallowedMarkers = [
      'TBD - created by archiving change',
      'Update Purpose after archive.',
      '## Purpose\nTBD',
      '## Purpose\r\nTBD',
    ];

    const offenders: string[] = [];
    for (const specFile of specFiles) {
      const content = await fs.readFile(specFile, 'utf-8');
      if (disallowedMarkers.some((marker) => content.includes(marker))) {
        offenders.push(path.relative(process.cwd(), specFile));
      }
    }

    expect(
      offenders,
      `Main specs still contain archive placeholder Purpose text:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });
});
