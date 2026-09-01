'use client';

import { AnyFunnelState, createUseFunnel } from '@use-funnel/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export * from '@use-funnel/core';

export const useFunnel = createUseFunnel(({ id, initialState }) => {
  const restoreCleanupRef = useRef<(() => void) | undefined>(undefined);
  const [location, setLocation] = useState(() => ({
    search: typeof window !== 'undefined' ? window.location.search : '',
  }));
  const [state, setState] = useState(() => ({
    ...(typeof window !== 'undefined' ? window.history.state : {}),
  }));

  useEffect(() => {
    // Restore a cleanup from React Strict Mode's setup-cleanup-setup replay.
    const restoreCleanup = restoreCleanupRef.current;
    restoreCleanupRef.current = undefined;
    restoreCleanup?.();

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
        restoreCleanupRef.current = undefined;

        const newHistoryState = {
          ...window.history.state,
        };

        const originalHref = window.location.href;
        const cleanupUrl = new URL(originalHref);
        const contextName = `${id}.context`;
        const historiesName = `${id}.histories`;
        const stepName = `${id}.step`;
        const currentContext = newHistoryState[contextName];
        const currentHistories = newHistoryState[historiesName];
        const currentStep = cleanupUrl.searchParams.get(stepName);

        if (currentContext == null || currentHistories == null || currentStep == null) {
          return;
        }

        delete newHistoryState[contextName];
        delete newHistoryState[historiesName];

        cleanupUrl.searchParams.delete(stepName);
        window.history.replaceState(newHistoryState, '', cleanupUrl);

        const cleanedHref = window.location.href;
        const cleanedHistoryState = window.history.state;

        restoreCleanupRef.current = () => {
          // Do not restore stale funnel state over another navigation.
          if (window.location.href !== cleanedHref || window.history.state !== cleanedHistoryState) {
            return;
          }

          const currentHistoryState = {
            ...window.history.state,
          };
          const currentSearchParams = new URLSearchParams(window.location.search);

          if (
            contextName in currentHistoryState ||
            historiesName in currentHistoryState ||
            currentSearchParams.has(stepName)
          ) {
            return;
          }

          currentHistoryState[contextName] = currentContext;
          currentHistoryState[historiesName] = currentHistories;
          window.history.replaceState(currentHistoryState, '', originalHref);
        };
      },
    }),
    [id, history, currentIndex, currentState, changeState],
  );
});
