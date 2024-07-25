import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import { createFunnelSteps } from '../src/stepBuilder';
import { createUseFunnel } from '../src/useFunnel';
import { MemoryRouter } from './memoryRouter';

const formState = z
  .object({
    id: z.string(),
    password: z.string(),
    passwordConfirm: z.string(),
    agreed: z.boolean(),
  })
  .partial();

const steps = createFunnelSteps(formState)
  .extends('아이디입력', () => ({
    parse: formState.parse,
  }))
  .extends('비밀번호입력', (formState) => {
    const meta = formState.required({ id: true });
    return {
      meta,
      parse: meta.parse,
    };
  })
  .extends('비밀번호확인', (formState) => {
    const meta = formState.required({ password: true });
    return {
      meta,
      parse: meta.parse,
    };
  })
  .extends(['약관동의', '그_다음_화면'], (formState) => {
    const meta = formState.required({ passwordConfirm: true });
    return {
      meta,
      parse: meta.parse,
    };
  })
  .build();

// const steps2 = createFunnelSteps<z.infer<typeof formState>>()
//   .extends('아이디입력')
//   .extends('비밀번호입력', { requiredKeys: 'id' })
//   .extends('비밀번호확인', { requiredKeys: 'password' })
//   .extends(['약관동의', '그_다음_화면'], { requiredKeys: 'passwordConfirm' })
//   .build();

const useFunnel = createUseFunnel(MemoryRouter);

describe('createContextGuard spec', () => {
  describe('when data is correct', () => {
    test('should return data with type guard', () => {
      const data = steps.비밀번호확인.parse({
        id: 'asdasdasd',
        password: '1234',
      });
      expect(data.password).not.toBeNull();
    });
  });

  describe('when data is incorrect', () => {
    test('should throw error', () => {
      expect(() => {
        steps.비밀번호확인.parse({
          id: 'asdasdasd',
        });
      }).toThrow();
    });
  });

  describe('with useFunnel', () => {
    describe('when initial data is correct', () => {
      test('result should be equal initial data', () => {
        const hook = renderHook(() =>
          useFunnel({
            id: 'context-guard-test',
            steps,
            initial: {
              step: '아이디입력',
              context: {},
            },
          }),
        );
        expect(hook.result.current.step).toBe('아이디입력');
        expect(hook.result.current.context).toEqual({});
      });
    });

    describe('when initial data is incorrect', () => {
      test('should throw error', () => {
        expect(() => {
          const userInput = {} as any;
          renderHook(() =>
            useFunnel({
              id: 'context-guard-test',
              steps,
              initial: {
                step: '비밀번호확인',
                context: userInput,
              },
            }),
          );
        }).toThrow();
      });
    });
  });
});
