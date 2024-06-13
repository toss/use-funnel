import { describe, expect, test } from 'vitest';
import { removeKeys } from '../src/util';

describe('Test removeKeys', () => {
  test('should work', async () => {
    const value = { a: 1, b: 2, c: 3, d: [4, 5, 6] };

    expect(removeKeys(value, ['b', 'd'])).toEqual({ a: 1, c: 3 });
    expect(value).toEqual({ a: 1, b: 2, c: 3, d: [4, 5, 6] });
  });
});
