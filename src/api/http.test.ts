import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_TIMEOUT_MS, fetchWithTimeout } from './http';

describe('fetchWithTimeout', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('returns the response and clears the timeout', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn(async () => new Response('ok')));

    const response = await fetchWithTimeout('https://example.com', {}, 5000);

    expect(await response.text()).toBe('ok');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('aborts the request when the timeout elapses', async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
        signal = init?.signal ?? undefined;
        return new Promise<Response>((_resolve, reject) => {
          signal!.addEventListener('abort', () =>
            reject(new DOMException('The operation was aborted.', 'AbortError'))
          );
        });
      })
    );

    const promise = fetchWithTimeout('https://example.com', {}, 250);
    // Attach a no-op catch so an eventual abort rejection is never flagged
    // as unhandled; the real assertion awaits the same promise below.
    promise.catch(() => {});
    await vi.advanceTimersByTimeAsync(250);

    expect(signal?.aborted).toBe(true);
    await expect(promise).rejects.toThrow();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('passes through fetch rejections', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      })
    );

    await expect(fetchWithTimeout('https://example.com')).rejects.toThrow('Failed to fetch');
  });

  it('exposes a sane default timeout', () => {
    expect(DEFAULT_TIMEOUT_MS).toBeGreaterThanOrEqual(10000);
  });
});
