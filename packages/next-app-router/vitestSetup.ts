import { beforeEach, beforeAll, vi, afterEach } from 'vitest';

let currentUrl = new URL('http://localhost/');

export const setMockUrl = (url: string) => {
  currentUrl = new URL(url);
};

export const mockSearchParamsGet = vi.fn((param: string) => {
  return currentUrl.searchParams.get(param);
});

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    value: {
      href: currentUrl.href,
      search: currentUrl.search,
    },
    writable: true,
  });

  vi.mock('next/navigation', () => ({
    useSearchParams: () => ({
      get: mockSearchParamsGet,
    }),
  }));
});

beforeEach(() => {
  setMockUrl('http://localhost/');
  vi.resetAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
