import { beforeEach, describe, expect, it, vi } from 'vitest';

// Zustand persist reads `window.localStorage` when the store module initializes,
// so both globals have to exist before the dynamic import in each test below.
const memory = new Map<string, string>();
const storageStub = {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => {
    memory.set(key, String(value));
  },
  removeItem: (key: string) => {
    memory.delete(key);
  },
  clear: () => {
    memory.clear();
  },
  key: (index: number) => Array.from(memory.keys())[index] ?? null,
  get length() {
    return memory.size;
  },
};

vi.stubGlobal('localStorage', storageStub);
vi.stubGlobal('window', { localStorage: storageStub });

function seedSettings(settings: Record<string, unknown>) {
  memory.set('manhwa-settings', JSON.stringify({ state: { settings }, version: 0 }));
}

beforeEach(() => {
  memory.clear();
  vi.resetModules();
});

describe('settings store hydration', () => {
  it('hydrates synchronously from localStorage', async () => {
    seedSettings({ theme: 'rose', defaultLibraryStatus: 'PLAN_TO_READ' });
    const { useSettingsStore } = await import('./stores');

    expect(useSettingsStore.getState().settings.theme).toBe('rose');
    expect(useSettingsStore.getState().settings.defaultLibraryStatus).toBe('PLAN_TO_READ');
  });

  it('normalizes the legacy "dark" theme to the default during hydration', async () => {
    seedSettings({ theme: 'dark', defaultLibraryStatus: 'READING' });
    const { useSettingsStore } = await import('./stores');

    expect(useSettingsStore.getState().settings.theme).toBe('violet');
  });

  it('falls back to defaults when nothing is persisted', async () => {
    const { useSettingsStore } = await import('./stores');

    expect(useSettingsStore.getState().settings.theme).toBe('violet');
    expect(useSettingsStore.getState().settings.defaultLibraryStatus).toBe('READING');
  });

  it('persists theme changes', async () => {
    const { useSettingsStore } = await import('./stores');

    useSettingsStore.getState().updateSettings({ theme: 'blue' });

    const raw = memory.get('manhwa-settings');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw as string).state.settings.theme).toBe('blue');
  });
});
