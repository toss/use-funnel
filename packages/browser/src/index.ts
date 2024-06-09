import { createUseFunnel } from '@use-funnel/core';
import { useEffect, useMemo, useState } from 'react';

export * from '@use-funnel/core';

export const useFunnel = createUseFunnel(({ id, initialState }) => {
  const [location, setLocation] = useState(() => ({
    search: window.location.search,
  }));
  const [state, setState] = useState(() => ({
    ...window.history.state,
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
        const searchParams = new URLSearchParams(location.search);
        searchParams.set(`${id}.step`, newState.step);
        const newHistoryState = {
          ...state,
          [`${id}.context`]: newState.context,
          [`${id}.histories`]: [...(history ?? []), newState],
        };
        window.history.pushState(newHistoryState, '', `?${searchParams.toString()}`);
        setLocation({
          search: window.location.search,
        });
        setState(newHistoryState);
      },
      replace(newState) {
        const searchParams = new URLSearchParams(location.search);
        searchParams.set(`${id}.step`, newState.step);
        const newHistoryState = {
          ...state,
          [`${id}.context`]: newState.context,
          [`${id}.histories`]: [...(history ?? []), newState],
        };
        window.history.replaceState(newHistoryState, '', `?${searchParams.toString()}`);
        setLocation({
          search: window.location.search,
        });
        setState(newHistoryState);
      },
      go(index) {
        window.history.go(index);
      },
    }),
    [history, currentIndex, currentState],
  );
});
