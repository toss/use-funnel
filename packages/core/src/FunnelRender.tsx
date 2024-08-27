import { Fragment, useMemo } from 'react';
import { AnyStepContextMap, FunnelHistory, FunnelStep, RouteOption } from './core.js';
import { FunnelRouterTransitionOption } from './router.js';
import { useUpdatableRef } from './utils.js';

export type FunnelStepByContextMap<TStepContextMap extends AnyStepContextMap, TRouteOption extends RouteOption> = {
  [TStepKey in keyof TStepContextMap & string]: FunnelStep<TStepContextMap, TStepKey, TRouteOption>;
}[keyof TStepContextMap & string];

export type FunnelRenderReady<
  TStepContextMap extends AnyStepContextMap,
  TRouteOption extends RouteOption,
> = FunnelStepByContextMap<TStepContextMap, TRouteOption>;

export type FunnelRenderOverlayHandler = {
  close: () => void;
};

export type RenderResult<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TRouteOption extends RouteOption,
> =
  | {
      type: 'render';
      render: (step: FunnelStep<TStepContextMap, TStepKey, TRouteOption>) => React.ReactNode;
    }
  | {
      type: 'overlay';
      render: (
        step: FunnelStep<TStepContextMap, TStepKey, TRouteOption> & FunnelRenderOverlayHandler,
      ) => React.ReactNode;
    };

export interface FunnelRenderComponentProps<
  TStepContextMap extends AnyStepContextMap,
  TRouteOption extends RouteOption,
> {
  funnel: FunnelRenderReady<TStepContextMap, TRouteOption>;
  steps: {
    [TStepKey in keyof TStepContextMap & string]:
      | RenderResult<TStepContextMap, TStepKey, TRouteOption>
      | ((step: FunnelStep<TStepContextMap, TStepKey, TRouteOption>) => React.ReactNode);
  };
}

function neverUseHistory(): never {
  throw new Error('Cannot use history in overlay render before steps.');
}

const overlayBeforeHistory: FunnelHistory<any, any, any> = {
  push: neverUseHistory,
  replace: neverUseHistory,
  go: neverUseHistory,
  back: neverUseHistory,
};

export function FunnelRender<TStepContextMap extends AnyStepContextMap, TRouteOption extends RouteOption>(
  props: FunnelRenderComponentProps<TStepContextMap, TRouteOption>,
) {
  const { funnel, steps } = props;
  const render = steps[funnel.step];
  let renderEntires: Array<[keyof TStepContextMap, React.ReactNode]> = [];

  const funnelRenderHistory = useOverwriteFunnelHistoryTransitionArgument(
    funnel.history,
    (step, _, transitionOption) => {
      const targetStep = steps[step];
      const isOverlay = typeof targetStep === 'object' && targetStep.type === 'overlay';
      const newTransitionOption: FunnelRouterTransitionOption = {
        ...transitionOption,
        renderComponent: {
          overlay: isOverlay,
        },
      };
      return newTransitionOption;
    },
  );

  const funnelRenderStep = useMemo(() => {
    return {
      ...funnel,
      history: funnelRenderHistory,
    };
  }, [funnel, funnelRenderHistory]);

  if (typeof render === 'function') {
    renderEntires.push([funnelRenderStep.step, render(funnelRenderStep)]);
  } else if (render.type === 'render') {
    renderEntires.push([funnelRenderStep.step, render.render(funnelRenderStep)]);
  } else if (render.type === 'overlay') {
    const beforeSteps = funnelRenderStep.historySteps.slice(0, funnelRenderStep.index);
    for (const step of beforeSteps.slice().reverse()) {
      const stepRender = steps[step.step];
      // NOTE: cannot use history in overlay render before steps
      if (typeof stepRender === 'function') {
        renderEntires.push([
          step.step,
          stepRender({
            ...funnelRenderStep,
            ...step,
            history: overlayBeforeHistory,
          }),
        ]);
        break;
      } else {
        renderEntires.push([
          step.step,
          stepRender.render({
            ...funnelRenderStep,
            ...step,
            history: overlayBeforeHistory,
            close: neverUseHistory,
          }),
        ]);
      }
    }
    renderEntires = renderEntires.slice().reverse();
    renderEntires.push([
      funnelRenderStep.step,
      render.render({
        ...funnelRenderStep,
        close: funnelRenderHistory.back,
      }),
    ]);
  }

  return (
    <Fragment>
      {renderEntires.map(([step, element]) => (
        <Fragment key={step.toString()}>{element}</Fragment>
      ))}
    </Fragment>
  );
}

function useOverwriteFunnelHistoryTransitionArgument<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TRouteOption extends RouteOption,
>(
  history: FunnelHistory<TStepContextMap, TStepKey, TRouteOption>,
  callback: (
    step: TStepKey,
    context?: TStepContextMap[TStepKey],
    option?: FunnelRouterTransitionOption,
  ) => FunnelRouterTransitionOption,
): FunnelHistory<TStepContextMap, TStepKey, TRouteOption> {
  const callbackRef = useUpdatableRef(callback);

  return useMemo(() => {
    return {
      ...history,
      push(...args) {
        const [step, context, option] = args;
        const newOption = callbackRef.current(
          step as unknown as TStepKey,
          context as TStepContextMap[TStepKey],
          option,
        );
        return (history.push as any)(step, context, newOption);
      },
      replace(...args) {
        const [step, context, option] = args;
        const newOption = callbackRef.current(
          step as unknown as TStepKey,
          context as TStepContextMap[TStepKey],
          option,
        );
        return (history.replace as any)(step, context, newOption);
      },
    };
  }, [history]);
}
