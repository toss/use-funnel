import { createUseFunnel } from '@use-funnel/core';
import { useRouter } from 'next/router.js';
import { useMemo } from 'react';
import { makePath, removeKeys } from './util';

export * from '@use-funnel/core';

const QS_KEY = 'funnel.';

const STEP_KEY = '.step';
const CONTEXT_KEY = '.context';
const HISTORY_KEY = '.histories';

const checkIsHistoryKey = (key: string) => key.startsWith(QS_KEY) && key.endsWith(HISTORY_KEY);

interface NextPageRouteOption {
  shallow?: boolean;
  locale?: string | false;
  scroll?: boolean;
}

export const useFunnel = createUseFunnel<NextPageRouteOption>(({ id, initialState }) => {
  const router = useRouter();

  const currentContext = useMemo(() => {
    try {
      const currentStep = router.query?.[`${QS_KEY}${id}${STEP_KEY}`] as string | undefined;
      const currentContext = router.query?.[`${QS_KEY}${id}${CONTEXT_KEY}`] as string | undefined;
      return currentStep == null || currentContext == null
        ? initialState
        : { step: currentStep, context: JSON.parse(currentContext) };
    } catch {
      return initialState;
    }
  }, [router.query, initialState]);

  const _beforeHistories = router.query?.[`${QS_KEY}${id}${HISTORY_KEY}`];
  const beforeHistories = useMemo<(typeof initialState)[]>(() => {
    try {
      return _beforeHistories == null ? [] : JSON.parse(_beforeHistories as string);
    } catch {
      return [];
    }
  }, [_beforeHistories]);

  const currentIndex = beforeHistories.length;

  return useMemo(
    () => ({
      history: [...beforeHistories, currentContext],
      currentIndex,
      async push(state, { scroll, locale, shallow = true } = {}) {
        const { pathname, query } = makePath(router);
        const queryContext = {
          [`${QS_KEY}${id}${STEP_KEY}`]: state.step,
          [`${QS_KEY}${id}${CONTEXT_KEY}`]: JSON.stringify(state.context),
        };

        await router.push(
          {
            pathname,
            query: {
              ...query,
              [`${QS_KEY}${id}${HISTORY_KEY}`]: JSON.stringify([...beforeHistories, currentContext]),
              ...queryContext,
            },
          },
          {
            pathname,
            query: { ...removeKeys(query, [checkIsHistoryKey]), ...queryContext },
          },
          {
            shallow,
            locale,
            scroll,
          },
        );
      },
      async replace(state, { scroll, locale, shallow = true } = {}) {
        const { pathname, query } = makePath(router);
        const queryContext = {
          [`${QS_KEY}${id}${STEP_KEY}`]: state.step,
          [`${QS_KEY}${id}${CONTEXT_KEY}`]: JSON.stringify(state.context),
        };

        await router.replace(
          {
            pathname,
            query: {
              ...query,
              ...queryContext,
            },
          },
          {
            pathname,
            query: { ...removeKeys(query, [checkIsHistoryKey]), ...queryContext },
          },
          {
            shallow,
            locale,
            scroll,
          },
        );
      },
      go: (index) => window.history.go(index),
    }),
    [router, currentIndex, beforeHistories, currentContext],
  );
});
