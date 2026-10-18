import type { ThemeId } from '../models/types';

export const DEFAULT_THEME: ThemeId = 'violet';

export const THEMES: ReadonlyArray<{ id: ThemeId; label: string; swatch: string }> = [
  { id: 'violet', label: 'Violet', swatch: 'oklch(60.6% 0.25 292.717)' },
  { id: 'blue', label: 'Blue', swatch: 'oklch(62.3% 0.214 259.815)' },
  { id: 'cyan', label: 'Cyan', swatch: 'oklch(71.5% 0.143 215.221)' },
  { id: 'emerald', label: 'Emerald', swatch: 'oklch(69.6% 0.17 162.48)' },
  { id: 'amber', label: 'Amber', swatch: 'oklch(76.9% 0.188 70.08)' },
  { id: 'rose', label: 'Rose', swatch: 'oklch(64.5% 0.246 16.439)' },
];

export function normalizeTheme(value: unknown): ThemeId {
  return THEMES.some((theme) => theme.id === value) ? (value as ThemeId) : DEFAULT_THEME;
}

export function applyTheme(
  value: unknown,
  root: { dataset: { [key: string]: string | undefined } } = document.documentElement
): void {
  root.dataset.theme = normalizeTheme(value);
}
