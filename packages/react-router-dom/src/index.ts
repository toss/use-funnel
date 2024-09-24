import { createUseFunnel } from '@use-funnel/core';
import { useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export * from '@use-funnel/core';

interface ReactRouterDomRouteOption {
  preventScrollReset?: boolean;
  unstable_flushSync?: boolean;
  unstable_viewTransition?: boolean;
}

export const useFunnel = createUseFunnel<ReactRouterDomRouteOption>(({ id, initialState }) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentStep = searchParams.get(`${id}.step`);
  const currentContext = location.state?.[`${id}.context`];
  const currentState = useMemo(() => {
    return currentStep != null && currentContext != null
      ? ({
          step: currentStep,
          context: currentContext,
        } as typeof initialState)
      : initialState;
  }, [currentStep, currentContext, initialState]);

  const history: (typeof initialState)[] = useMemo(() => {
    const histories = location.state?.[`${id}.histories`];
    if (Array.isArray(histories) && histories.length > 0) {
      return histories;
    } else {
      return [currentState];
    }
  }, [location.state, currentState]);

  const currentIndex = history.length - 1;

  return useMemo(
    () => ({
      history,
      currentIndex,
      push(state, { preventScrollReset, unstable_flushSync, unstable_viewTransition } = {}) {
        setSearchParams(
          (prev) => {
            prev.set(`${id}.step`, state.step);
            return prev;
          },
          {
            replace: false,
            state: {
              ...location.state,
              [`${id}.context`]: state.context,
              [`${id}.histories`]: [...(history ?? []), state],
            },
            preventScrollReset,
            unstable_flushSync,
            unstable_viewTransition,
          },
        );
      },
      replace(state, { preventScrollReset, unstable_flushSync, unstable_viewTransition } = {}) {
        setSearchParams(
          (prev) => {
            prev.set(`${id}.step`, state.step);
            return prev;
          },
          {
            replace: true,
            state: {
              ...location.state,
              [`${id}.context`]: state.context,
              [`${id}.histories`]: [...(history ?? []).slice(0, currentIndex), state],
            },
            preventScrollReset,
            unstable_flushSync,
            unstable_viewTransition,
          },
        );
      },
      go: (index) => {
        navigate(index);
      },
    }),
    [currentState, history, currentIndex, setSearchParams, navigate, location.state],
  );
});
