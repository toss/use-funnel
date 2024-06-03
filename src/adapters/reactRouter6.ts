import { useMemo } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { Adapter } from "./type.js";

export const ReactRouterV6Adapter: Adapter = ({ id, initialState }) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentStep = searchParams.get(`${id}.step`);
  const currentContext = location.state?.[`${id}.context`];
  const currentId = location.state?.[`${id}.id`];
  const currentState = useMemo(() => {
    return currentStep != null && currentContext != null && currentId != null
      ? ({
          step: currentStep,
          context: currentContext,
          id: currentId,
        } as typeof initialState)
      : initialState;
  }, [currentStep, currentContext, initialState]);

  const history: (typeof initialState)[] = useMemo(
    () => location.state?.[`${id}.histories`] ?? [currentState],
    [location.state, currentState]
  );
  const currentIndex = history.length - 1;

  return useMemo(
    () => ({
      history,
      currentIndex,
      currentState,
      async push(state) {
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
              [`${id}.id`]: state.id,
              [`${id}.histories`]: [...(history ?? []), state],
            },
          }
        );
      },
      async replace(state) {
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
              [`${id}.id`]: state.id,
              [`${id}.histories}`]: [
                ...(history ?? []).slice(0, currentIndex),
                state,
              ],
            },
          }
        );
      },
      async go(index) {
        navigate(index);
      },
    }),
    [
      currentState,
      history,
      currentIndex,
      setSearchParams,
      navigate,
      location.state,
    ]
  );
};
