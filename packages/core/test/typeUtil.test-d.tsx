import { describe, expectTypeOf, test } from 'vitest';
import { CompareMergeContext, OptionalCompareKeys, RequiredCompareKeys } from '../src/typeUtil';

describe('typeUtil test', () => {
  describe('RequiredCompareKeys', () => {
    describe('When TBase has optional keys and TResult has compare required key', () => {
      test('Should return the keys that are required when converting from TBase to TResult', () => {
        type Result = RequiredCompareKeys<{ a: string; b?: string }, { a: string; b: string }>;
        expectTypeOf<Result>().toEqualTypeOf<'b'>();
      });
    });

    describe('When TBase has no key and TResult has compare required key', () => {
      test('Should return the keys that are required when converting from TBase to TResult', () => {
        type Result = RequiredCompareKeys<{ a: string }, { a: string; b: string }>;
        expectTypeOf<Result>().toEqualTypeOf<'b'>();
      });
    });

    describe('When TBase has no keys', () => {
      test('Should return the keys that are required when converting from TBase to TResult', () => {
        type Result = RequiredCompareKeys<{}, { a: string; b: string }>;
        expectTypeOf<Result>().toEqualTypeOf<'a' | 'b'>();
      });
    });

    describe('When TBase and TResult have no keys', () => {
      test('Should return the never', () => {
        type Result = RequiredCompareKeys<{}, {}>;
        expectTypeOf<Result>().toEqualTypeOf<never>();
      });
    });

    describe('When TBase and TResult have the same type', () => {
      test('Should return the never', () => {
        type Result = RequiredCompareKeys<{ a: string; b: string }, { a: string; b: string }>;
        expectTypeOf<Result>().toEqualTypeOf<never>();
      });
    });
  });

  describe('OptionalCompareKeys', () => {
    describe('When TBase has optional keys and TResult has compare required key', () => {
      test('Should return the keys that are optional when converting from TBase to TResult', () => {
        type Result = OptionalCompareKeys<{ a: string; b?: string }, { a: string; b: string }>;
        expectTypeOf<Result>().toEqualTypeOf<'a'>();
      });
    });

    describe('When TBase has no key and TResult has compare required key', () => {
      test('Should return the keys that are optional when converting from TBase to TResult', () => {
        type Result = OptionalCompareKeys<{ a: string }, { a: string; b: string }>;
        expectTypeOf<Result>().toEqualTypeOf<'a'>();
      });
    });

    describe('When TBase has no key and TResult has compare optional key', () => {
      test('Should return the keys that are optional when converting from TBase to TResult', () => {
        type Result = OptionalCompareKeys<{ a: string }, { a: string; b?: string }>;
        expectTypeOf<Result>().toEqualTypeOf<'a' | 'b'>();
      });
    });

    describe('When TBase has no keys', () => {
      test('Should return the never', () => {
        type Result = OptionalCompareKeys<{}, { a: string; b: string }>;
        expectTypeOf<Result>().toEqualTypeOf<never>();
      });
    });

    describe('When TBase and TResult have no keys', () => {
      test('Should return the never', () => {
        type Result = OptionalCompareKeys<{}, {}>;
        expectTypeOf<Result>().toEqualTypeOf<never>();
      });
    });

    describe('When TBase and TResult have the same type', () => {
      test('Should return all key', () => {
        type Result = OptionalCompareKeys<{ a: string; b: string }, { a: string; b: string }>;
        expectTypeOf<Result>().toEqualTypeOf<'a' | 'b'>();
      });
    });

    describe('When TBase has required keys and TResult compare nothing key', () => {
      test('Should return the TBase keys', () => {
        type Result = OptionalCompareKeys<{ a: string; b: string }, { c: number }>;
        expectTypeOf<Result>().toEqualTypeOf<'a' | 'b'>();
      });
    });
  });

  describe('CompareMergeContext', () => {
    describe('When TBase has optional keys and TResult has compare required key', () => {
      test('Should return the new object that uses TResult values for required keys, and TBase values for optional keys', () => {
        type Result = CompareMergeContext<{ a: string; b?: string }, { a: string; b: string }>;
        expectTypeOf<Result>().toEqualTypeOf<{ a?: string; b: string }>();
      });
    });

    describe('When TBase has no key and TResult has compare required key', () => {
      test('Should return the new object that uses TResult values for required keys, and TBase values for optional keys', () => {
        type Result = CompareMergeContext<{ a: string }, { a: string; b: string }>;
        expectTypeOf<Result>().toEqualTypeOf<{ a?: string; b: string }>();
      });
    });

    describe('When TBase has no key and TResult has compare optional key', () => {
      test('Should return the new object that uses TResult values for optional keys, and TBase values for optional keys', () => {
        type Result = CompareMergeContext<{ a: string }, { a: string; b?: string }>;
        expectTypeOf<Result>().toEqualTypeOf<{ a?: string; b?: string }>();
      });
    });

    describe('When TBase has no keys', () => {
      test('Should return the TResult type', () => {
        type Result = CompareMergeContext<{}, { a: string; b: string }>;
        expectTypeOf<Result>().toEqualTypeOf<{ a: string; b: string }>();
      });
    });

    describe('When TBase and TResult have no keys', () => {
      test('Should return the empty object', () => {
        type Result = CompareMergeContext<{}, {}>;
        expectTypeOf<Result>().toEqualTypeOf<{}>();
      });
    });

    describe('When TBase and TResult have the same type', () => {
      test('Should return the new object patial object for that types', () => {
        type Result = CompareMergeContext<{ a: string; b: string }, { a: string; b: string }>;
        expectTypeOf<Result>().toEqualTypeOf<{ a?: string; b?: string }>();
      });
    });

    describe('When TBase has required keys and TResult compare nothing key', () => {
      test('Should return the new object that uses TResult values for required keys, and TBase values for optional keys', () => {
        type Result = CompareMergeContext<{ a: string; b: string }, { c: number }>;
        expectTypeOf<Result>().toEqualTypeOf<{ a?: string; b?: string; c: number }>();
      });
    });
  });
});
