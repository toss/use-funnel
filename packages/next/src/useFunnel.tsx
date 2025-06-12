import { createUseFunnel } from '@use-funnel/core';
import { useMemo, useRef } from 'react';
import { useNextRouter } from './useNextRouter';
import { makePath, parseQueryJson, removeKeys, stringifyQueryJson } from './util';

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

interface NextPageFunnelOption {
  stepQueryName?: (id: string) => string;
  contextQueryName?: (id: string) => string;
  historyQueryName?: (id: string) => string;
  suspense?: boolean;
}

export const useFunnel = createUseFunnel<NextPageRouteOption, NextPageFunnelOption>(
  ({
    id,
    initialState,
    steps,
    stepQueryName = (id) => `${QS_KEY}${id}${STEP_KEY}`,
    contextQueryName = (id) => `${QS_KEY}${id}${CONTEXT_KEY}`,
    historyQueryName = (id) => `${QS_KEY}${id}${HISTORY_KEY}`,
    suspense,
  }) => {
    const router = useNextRouter({ suspense });

    const routerRef = useRef(router);
    routerRef.current = router;

    const stepQueryNameRef = useRef(stepQueryName);
    stepQueryNameRef.current = stepQueryName;
    const contextQueryNameRef = useRef(contextQueryName);
    contextQueryNameRef.current = contextQueryName;
    const historyQueryNameRef = useRef(historyQueryName);
    historyQueryNameRef.current = historyQueryName;

    const currentContext = useMemo(() => {
      try {
        const currentStep = router.query?.[stepQueryNameRef.current(id)] as string | undefined;
        const currentContext = router.query?.[contextQueryNameRef.current(id)] as string | undefined;
        return currentStep == null || currentContext == null || (steps != null && !(currentStep in steps))
          ? initialState
          : { step: currentStep, context: parseQueryJson(currentContext) };
      } catch {
        return initialState;
      }
    }, [router.query, initialState]);

    const _beforeHistories = router.query?.[historyQueryNameRef.current(id)];
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
            [stepQueryNameRef.current(id)]: state.step,
            [contextQueryNameRef.current(id)]: stringifyQueryJson(state.context),
          };

          await router.push(
            {
              pathname,
              query: {
                ...(preserveQuery ? query : {}),
                [historyQueryNameRef.current(id)]: stringifyQueryJson([...beforeHistories, currentContext]),
                ...queryContext,
                ...paramsQuery,
              },
            },
            {
              pathname,
              query: {
                ...removeKeys(query, [checkIsHistoryKey, historyQueryNameRef.current(id)]),
                ...queryContext,
                ...paramsQuery,
              },
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
            [stepQueryNameRef.current(id)]: state.step,
            [contextQueryNameRef.current(id)]: stringifyQueryJson(state.context),
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
              query: { ...removeKeys(query, [checkIsHistoryKey, historyQueryNameRef.current(id)]), ...queryContext },
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
          if (
            !searchParams.has(historyQueryNameRef.current(id)) ||
            !searchParams.has(contextQueryNameRef.current(id))
          ) {
            return;
          }

          const { pathname, query } = makePath(routerRef.current);
          const queryContext = {
            [stepQueryNameRef.current(id)]: undefined,
            [contextQueryNameRef.current(id)]: undefined,
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
              query: { ...removeKeys(query, [checkIsHistoryKey, historyQueryNameRef.current(id)]), ...queryContext },
            },
            {
              shallow: true,
            },
          );
        },
      }),
      [
        id,
        router,
        currentIndex,
        beforeHistories,
        currentContext,
        stepQueryNameRef,
        contextQueryNameRef,
        historyQueryNameRef,
      ],
    );
  },
);
