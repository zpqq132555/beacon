import { describe, expect, it } from 'vitest';
import {
  formatSelectedSummary,
  getSelectedChoiceNames,
  invertChoices,
  renderSelectedSummaryLine,
  selectAllChoices,
  toggleChoice,
  type PlatformSelectChoice,
} from '../../src/commands/platform-select-prompt.js';

const choices: PlatformSelectChoice<string>[] = [
  { name: 'Claude Code', value: 'claude', checked: true },
  { name: 'Codex (detected)', summaryName: 'Codex', value: 'codex', checked: true },
  { name: 'Trae', value: 'trae', checked: false },
];

describe('platform select prompt helpers', () => {
  it('uses summaryName before name when formatting the selected summary', () => {
    expect(getSelectedChoiceNames(choices)).toEqual(['Claude Code', 'Codex']);
    expect(formatSelectedSummary(choices, 'none')).toBe('Claude Code, Codex');
  });

  it('uses the empty label when no choices are selected', () => {
    const emptyChoices = choices.map((choice) => ({ ...choice, checked: false }));

    expect(getSelectedChoiceNames(emptyChoices)).toEqual([]);
    expect(formatSelectedSummary(emptyChoices, 'none')).toBe('none');
  });

  it('toggles one choice without mutating the original choices', () => {
    const toggled = toggleChoice(choices, 'trae');

    expect(toggled.map((choice) => choice.checked)).toEqual([true, true, true]);
    expect(choices.map((choice) => choice.checked)).toEqual([true, true, false]);
  });

  it('selects all choices without mutating the original choices', () => {
    const selected = selectAllChoices(choices);

    expect(selected.map((choice) => choice.checked)).toEqual([true, true, true]);
    expect(choices.map((choice) => choice.checked)).toEqual([true, true, false]);
  });

  it('inverts all choices without mutating the original choices', () => {
    const inverted = invertChoices(choices);

    expect(inverted.map((choice) => choice.checked)).toEqual([false, false, true]);
    expect(choices.map((choice) => choice.checked)).toEqual([true, true, false]);
  });

  it('renders a localized selected summary line', () => {
    expect(
      renderSelectedSummaryLine({
        choices,
        selectedLabel: 'Selected:',
        emptyLabel: 'none',
      }),
    ).toBe('Selected: Claude Code, Codex');
  });
});
