import { describe, expect, test } from 'vitest';
import { createFunnelSteps } from '../src/stepBuilder';

interface FormState {
  id?: string;
  password?: string;
  passwordConfirm?: string;
  agreed?: boolean;
}

const steps = createFunnelSteps<FormState>()
  .extends('아이디입력')
  .extends('비밀번호입력', { requiredKeys: 'id' })
  .extends('비밀번호확인', { requiredKeys: 'password' })
  .extends(['약관동의', '그_다음_화면'], { requiredKeys: 'passwordConfirm' })
  .build();

describe('createContextGuard spec', () => {
  describe('when data is correct', () => {
    test('should return true', () => {
      const guard = steps.비밀번호확인.guard({
        id: 'asdasdasd',
        password: '1234',
      });
      expect(guard).toBe(true);
    });
  });

  describe('when data is incorrect', () => {
    test('should return false', () => {
      const guard = steps.비밀번호확인.guard({
        id: 'asdasdasd',
      });
      expect(guard).toBe(false);
    });
  });

  describe('when step is extends with empty option', () => {
    describe('when step is first extended', () => {
      test('the empty option has no guard', () => {
        expect(steps.아이디입력).toBeUndefined();
      });
    });

    test('step option is equal then previous step option', () => {
      const step1 = steps.그_다음_화면;
      const step2 = steps.약관동의;
      expect(step1).toEqual(step2);
      expect(
        step1.guard({
          id: 'asdasdasd',
          password: '1234',
          passwordConfirm: '1234',
        }),
      ).toBe(true);
      expect(
        step1.guard({
          id: 'asdasdasd',
          password: '1234',
        }),
      ).toBe(false);
    });
  });
});
