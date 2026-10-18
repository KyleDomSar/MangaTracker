import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME, THEMES, applyTheme, normalizeTheme } from './themes';

function fakeRoot() {
  return { dataset: {} as { [key: string]: string | undefined } };
}

describe('normalizeTheme', () => {
  it('returns a known theme id unchanged', () => {
    expect(normalizeTheme('blue')).toBe('blue');
    expect(normalizeTheme('rose')).toBe('rose');
  });

  it('falls back to the default for legacy or invalid values', () => {
    expect(normalizeTheme('dark')).toBe(DEFAULT_THEME);
    expect(normalizeTheme('')).toBe(DEFAULT_THEME);
    expect(normalizeTheme(undefined)).toBe(DEFAULT_THEME);
    expect(normalizeTheme(42)).toBe(DEFAULT_THEME);
  });
});

describe('applyTheme', () => {
  it('sets data-theme on the injected root for a valid theme', () => {
    const root = fakeRoot();
    applyTheme('emerald', root);
    expect(root.dataset.theme).toBe('emerald');
  });

  it('normalizes legacy values before setting the attribute', () => {
    const root = fakeRoot();
    applyTheme('dark', root);
    expect(root.dataset.theme).toBe(DEFAULT_THEME);
  });
});

describe('THEMES', () => {
  it('contains six unique presets including the default', () => {
    expect(THEMES).toHaveLength(6);
    expect(new Set(THEMES.map((t) => t.id)).size).toBe(6);
    expect(THEMES.map((t) => t.id)).toContain(DEFAULT_THEME);
  });
});
