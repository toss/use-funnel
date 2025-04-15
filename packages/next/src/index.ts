import { createUseFunnel } from '@use-funnel/core';
import { useRouter } from 'next/router.js';
import { useMemo, useRef } from 'react';
import { makePath, parseQueryJson, removeKeys, stringifyQueryJson } from './util';

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
  query?: Record<string, string>;
  preserveQuery?: boolean;
}

export const useFunnel = createUseFunnel<NextPageRouteOption>(({ id, initialState }) => {
  const router = useRouter();

  const routerRef = useRef(router);
  routerRef.current = router;

  const currentContext = useMemo(() => {
    try {
      const currentStep = router.query?.[`${QS_KEY}${id}${STEP_KEY}`] as string | undefined;
      const currentContext = router.query?.[`${QS_KEY}${id}${CONTEXT_KEY}`] as string | undefined;
      return currentStep == null || currentContext == null
        ? initialState
        : { step: currentStep, context: parseQueryJson(currentContext) };
    } catch {
      return initialState;
    }
  }, [router.query, initialState]);

  const _beforeHistories = router.query?.[`${QS_KEY}${id}${HISTORY_KEY}`];
  const beforeHistories = useMemo<(typeof initialState)[]>(() => {
    try {
      return _beforeHistories == null ? [] : parseQueryJson(_beforeHistories as string);
    } catch {
      return [];
    }
  }, [_beforeHistories]);

  const currentIndex = beforeHistories.length;

  return useMemo(
    () => ({
      history: [...beforeHistories, currentContext],
      currentIndex,
      async push(state, { scroll, locale, shallow = true, query: paramsQuery, preserveQuery = true } = {}) {
        const { pathname, query } = makePath(routerRef.current);
        const queryContext = {
          [`${QS_KEY}${id}${STEP_KEY}`]: state.step,
          [`${QS_KEY}${id}${CONTEXT_KEY}`]: stringifyQueryJson(state.context),
        };

        await router.push(
          {
            pathname,
            query: {
              ...(preserveQuery ? query : {}),
              [`${QS_KEY}${id}${HISTORY_KEY}`]: stringifyQueryJson([...beforeHistories, currentContext]),
              ...queryContext,
              ...paramsQuery,
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
      async replace(state, { scroll, locale, shallow = true, query: paramsQuery, preserveQuery = true } = {}) {
        const { pathname, query } = makePath(routerRef.current);
        const queryContext = {
          [`${QS_KEY}${id}${STEP_KEY}`]: state.step,
          [`${QS_KEY}${id}${CONTEXT_KEY}`]: stringifyQueryJson(state.context),
        };

        await router.replace(
          {
            pathname,
            query: {
              ...(preserveQuery ? query : {}),
              ...queryContext,
              ...paramsQuery,
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
      async cleanup() {
        const searchParams = new URLSearchParams(window.location.search);
        if (!searchParams.has(`${QS_KEY}${id}${HISTORY_KEY}`) || !searchParams.has(`${QS_KEY}${id}${CONTEXT_KEY}`)) {
          return;
        }

        const { pathname, query } = makePath(routerRef.current);
        const queryContext = {
          [`${QS_KEY}${id}${STEP_KEY}`]: undefined,
          [`${QS_KEY}${id}${CONTEXT_KEY}`]: undefined,
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
            shallow: true,
          },
        );
      },
    }),
    [id, router, currentIndex, beforeHistories, currentContext],
  );
});
