import { Fragment } from 'react';
import { AnyStepContextMap, FunnelStep } from './core.js';

export type FunnelStepByContextMap<TStepContextMap extends AnyStepContextMap> = {
  [TStepKey in keyof TStepContextMap & string]: FunnelStep<TStepContextMap, TStepKey>;
}[keyof TStepContextMap & string];

export type FunnelRenderReady<TStepContextMap extends AnyStepContextMap> = FunnelStepByContextMap<TStepContextMap>;

export type RenderResult<TStepContextMap extends AnyStepContextMap, TStepKey extends keyof TStepContextMap & string> =
  | {
      type: 'render';
      render: (step: FunnelStep<TStepContextMap, TStepKey>) => React.ReactNode;
    }
  | {
      type: 'overlay';
      render: (step: FunnelStep<TStepContextMap, TStepKey>) => React.ReactNode;
    };

export interface FunnelRenderComponentProps<TStepContextMap extends AnyStepContextMap> {
  funnel: FunnelRenderReady<TStepContextMap>;
  steps: {
    [TStepKey in keyof TStepContextMap & string]:
      | RenderResult<TStepContextMap, TStepKey>
      | ((step: FunnelStep<TStepContextMap, TStepKey>) => React.ReactNode);
  };
}

export function FunnelRender<TStepContextMap extends AnyStepContextMap>(
  props: FunnelRenderComponentProps<TStepContextMap>,
) {
  const { funnel, steps } = props;
  const render = steps[funnel.step];
  let renderEntires: Array<[keyof TStepContextMap, React.ReactNode]> = [];

  if (typeof render === 'function') {
    renderEntires.push([funnel.step, render(funnel)]);
  } else if (render.type === 'render') {
    renderEntires.push([funnel.step, render.render(funnel)]);
  } else if (render.type === 'overlay') {
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
