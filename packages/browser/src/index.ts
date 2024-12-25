'use client';
import { AnyFunnelState, createUseFunnel } from '@use-funnel/core';
import { useCallback, useEffect, useMemo, useState } from 'react';

export * from '@use-funnel/core';

function unmountFunnel(id: string) {
  const newHistoryState = {
    ...window.history.state,
  };

  delete newHistoryState[`${id}.context`];
  delete newHistoryState[`${id}.histories`];

  window.history.replaceState(newHistoryState, '');
}

export const useFunnel = createUseFunnel(({ id, initialState }) => {
  const [location, setLocation] = useState(() => ({
    search: typeof window !== 'undefined' ? window.location.search : '',
  }));
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') {
      return {};
    }

    const isSubFunnelIdDuplicated = window.history.state[`${id}.histories`];
    if (isSubFunnelIdDuplicated) {
      console.error(`Duplicate sub funnel ids detected in main funnel. This may cause unexpected step rendering.`);
    }

    return window.history.state;
  });

  useEffect(() => {
    function handlePopState(event: PopStateEvent) {
      setLocation(window.location);
      setState(event.state);
    }
    window.addEventListener('popstate', handlePopState);
    return () => {
      unmountFunnel(id);
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
      const searchParams = new URLSearchParams(location.search);
      searchParams.set(`${id}.step`, newState.step);

      const newHistoryState = {
        ...window.history.state,
        [`${id}.context`]: newState.context,
        [`${id}.histories`]: [...(history ?? []), newState],
      };

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
      go: (index) => {
        window.history.go(index);
      },
    }),
    [history, currentIndex, currentState, changeState],
  );
});
