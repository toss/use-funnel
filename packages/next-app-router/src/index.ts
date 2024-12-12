'use client';
import { createUseFunnel } from '@use-funnel/core';
import { useSearchParams } from 'next/navigation';
import { useLayoutEffect, useMemo, useState } from 'react';

export const useFunnel = createUseFunnel(({ id, initialState }) => {
  const searchParams = useSearchParams();
  const [state, setState] = useState<Record<string, any>>({});
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      setState(window.history.state);
    }

    function handlePopState(event: PopStateEvent) {
      setState(event.state);
    }
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const currentStep = searchParams.get(`${id}.step`);
  const currentContext = state?.[`${id}.context`];

  const currentState = useMemo(() => {
    return currentStep != null && currentContext != null
      ? ({
          step: currentStep,
          context: currentContext,
        } as typeof initialState)
      : initialState;
  }, [currentStep, currentContext, initialState]);

  const history: (typeof initialState)[] = useMemo(
    () => state?.[`${id}.histories`] ?? [currentState],
    [state, currentState],
  );

  const currentIndex = history.length - 1;
  return useMemo(
    () => ({
      history,
      currentIndex,
      currentState,
      push(newState) {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set(`${id}.step`, newState.step);
        const newHistoryState = {
          ...state,
          [`${id}.context`]: newState.context,
          [`${id}.histories`]: [...(history ?? []), newState],
        };
        window.history.pushState(newHistoryState, '', `?${newSearchParams.toString()}`);

        setState((prevHistoryState) => {
          const newHistoryState = {
            ...prevHistoryState,
            [`${id}.context`]: newState.context,
            [`${id}.histories`]: [...(history ?? []), newState],
          };
          return newHistoryState;
        });
      },
      replace(newState) {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set(`${id}.step`, newState.step);
        const newHistoryState = {
          ...state,
          [`${id}.context`]: newState.context,
          [`${id}.histories`]: [...(history ?? []), newState],
        };
        window.history.replaceState(newHistoryState, '', `?${newSearchParams.toString()}`);

        setState((prevHistoryState) => {
          const newHistoryState = {
            ...prevHistoryState,
            [`${id}.context`]: newState.context,
            [`${id}.histories`]: [...(history ?? []), newState],
          };
          return newHistoryState;
        });
      },
      go(index) {
        window.history.go(index);
      },
    }),
    [history, currentIndex, currentState, searchParams, id, state],
  );
});
