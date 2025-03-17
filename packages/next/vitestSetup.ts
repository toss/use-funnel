import { beforeAll, vi } from 'vitest';

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  vi.mock('next/router', () => require('next-router-mock'));
});
