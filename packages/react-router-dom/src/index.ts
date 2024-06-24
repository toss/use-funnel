import { createUseFunnel } from '@use-funnel/core';
import { useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export * from '@use-funnel/core';

export const useFunnel = createUseFunnel(({ id, initialState }) => {
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

  const history: (typeof initialState)[] = useMemo(
    () => location.state?.[`${id}.histories`] ?? [currentState],
    [location.state, currentState],
  );
  const currentIndex = history.length - 1;

  return useMemo(
    () => ({
      history,
      currentIndex,
      currentState,
      push(state) {
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
          },
        );
      },
      replace(state) {
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
              [`${id}.histories}`]: [...(history ?? []).slice(0, currentIndex), state],
            },
          },
        );
      },
    }),
    [currentState, history, currentIndex, setSearchParams, navigate, location.state],
  );
});
