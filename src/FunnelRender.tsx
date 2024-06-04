import { Fragment } from 'react';
import { AnyStepContextMap, FunnelStep } from './core.js';

export type FunnelStepByContextMap<TStepContextMap extends AnyStepContextMap> =
  {
    [TStepKey in keyof TStepContextMap & string]: FunnelStep<
      TStepContextMap,
      TStepKey
    >;
  }[keyof TStepContextMap & string];

export type FunnelRenderReady<TStepContextMap extends AnyStepContextMap> =
  FunnelStepByContextMap<TStepContextMap>;

type RenderResult<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
> =
  | ((step: FunnelStep<TStepContextMap, TStepKey>) => React.ReactElement)
  | {
      type: 'overlay';
      render: (
        step: FunnelStep<TStepContextMap, TStepKey>
      ) => React.ReactElement;
    };

export interface FunnelRenderComponentProps<
  TStepContextMap extends AnyStepContextMap,
> {
  funnel: FunnelRenderReady<TStepContextMap>;
  steps: {
    [TStepKey in keyof TStepContextMap & string]: RenderResult<
      TStepContextMap,
      TStepKey
    >;
  };
}

export function FunnelRender<TStepContextMap extends AnyStepContextMap>(
  props: FunnelRenderComponentProps<TStepContextMap>
) {
  const { funnel, steps } = props;
  const render = steps[funnel.step];
  let renderEntires: Array<[keyof TStepContextMap, React.ReactElement]> = [];

  if (typeof render === 'function') {
    renderEntires.push([funnel.step, render(funnel)]);
  } else {
    for (const step of funnel.beforeSteps.slice().reverse()) {
      const stepRender = steps[step.step];
      if (typeof stepRender === 'function') {
        renderEntires.push([
          step.step,
          stepRender({
            ...funnel,
            ...step,
          }),
        ]);
        break;
      } else {
        renderEntires.push([
          step.step,
          stepRender.render({
            ...funnel,
            ...step,
          }),
        ]);
      }
    }
    renderEntires = renderEntires.slice().reverse();
    renderEntires.push([funnel.step, render.render(funnel)]);
  }

  return (
    <Fragment>
      {renderEntires.map(([step, element]) => (
        <Fragment key={step.toString()}>{element}</Fragment>
      ))}
    </Fragment>
  );
}
