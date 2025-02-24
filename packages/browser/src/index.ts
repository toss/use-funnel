'use client';
import { AnyFunnelState, createUseFunnel } from '@use-funnel/core';
import { useCallback, useEffect, useMemo, useState } from 'react';

export * from '@use-funnel/core';

export const useFunnel = createUseFunnel(({ id, initialState }) => {
  const [location, setLocation] = useState(() => ({
    search: typeof window !== 'undefined' ? window.location.search : '',
  }));
  const [state, setState] = useState(() => ({
    ...(typeof window !== 'undefined' ? window.history.state : {}),
  }));

  useEffect(() => {
    function handlePopState(event: PopStateEvent) {
      setLocation(window.location);
      setState(event.state);
    }
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const currentStep = new URLSearchParams(location.search).get(`${id}.step`);
  const currentContext = state?.[`${id}.context`];
  const currentState: typeof initialState = useMemo(() => {
    if (currentStep != null && currentContext != null) {
      return {
        step: currentStep,
        context: currentContext,
      };
    }

    return initialState;
  }, [currentStep, currentContext, initialState]);

  const history: (typeof initialState)[] = useMemo(
    () => state?.[`${id}.histories`] ?? [currentState],
    [state, currentState],
  );
  const currentIndex = history.length - 1;

  const changeState = useCallback(
    (method: 'pushState' | 'replaceState', newState: AnyFunnelState) => {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set(`${id}.step`, newState.step);

      const newHistoryState = {
        ...window.history.state,
        [`${id}.context`]: newState.context,
        [`${id}.histories`]:
          method === 'pushState' ? [...(history ?? []), newState] : [...history.slice(0, currentIndex), newState],
      };

      console.log('changeState', method, newHistoryState, `?${searchParams.toString()}`);
      window.history[method](newHistoryState, '', `?${searchParams.toString()}`);

      setLocation({
        search: window.location.search,
      });
      setState(newHistoryState);
    },
    [location, history],
  );

  return useMemo(
    () => ({
      history,
      currentIndex,
      currentState,
      push(newState) {
        changeState('pushState', newState);
      },
      replace(newState) {
        changeState('replaceState', newState);
      },
      go(index) {
        window.history.go(index);
      },
      cleanup() {
        const newHistoryState = {
          ...window.history.state,
        };

        const searchParams = new URLSearchParams(window.location.search);

        if (
          newHistoryState[`${id}.context`] == null ||
          newHistoryState[`${id}.histories`] == null ||
          searchParams.get(`${id}.step`) == null
        ) {
          return;
        }

        delete newHistoryState[`${id}.context`];
        delete newHistoryState[`${id}.histories`];

        searchParams.delete(`${id}.step`);
        debugger;
        console.log('cleanup', id, newHistoryState, `?${searchParams.toString()}`);
        window.history.replaceState(newHistoryState, '', `?${searchParams.toString()}`);
      },
    }),
    [id, history, currentIndex, currentState, changeState],
  );
});
