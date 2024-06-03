import { Fragment, useRef } from "react";
import { AnyStepContextMap, FunnelStep, State } from "./core.js";

export type FunnelStepByContextMap<TStepContextMap extends AnyStepContextMap> =
  {
    [TStepKey in keyof TStepContextMap]: FunnelStep<TStepContextMap, TStepKey>;
  }[keyof TStepContextMap];

export type FunnelRenderReady<TStepContextMap extends AnyStepContextMap> =
  FunnelStepByContextMap<TStepContextMap>;

type RenderResult<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap
> =
  | ((step: FunnelStep<TStepContextMap, TStepKey>) => React.ReactElement)
  | {
      type: "overlay";
      render: (
        step: FunnelStep<TStepContextMap, TStepKey>
      ) => React.ReactElement;
    };

export interface FunnelRenderComponentProps<
  TStepContextMap extends AnyStepContextMap
> {
  funnel: FunnelRenderReady<TStepContextMap>;
  steps: {
    [TStepKey in keyof TStepContextMap]: RenderResult<
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
  let renderEntires: Array<
    [string, keyof TStepContextMap, React.ReactElement]
  > = [];

  if (typeof render === "function") {
    renderEntires.push([funnel.id, funnel.step, render(funnel)]);
  } else {
    for (const step of funnel.beforeSteps.slice().reverse()) {
      const stepRender = steps[step.step];
      if (typeof stepRender === "function") {
        renderEntires.push([
          step.id,
          step.step,
          stepRender({
            ...funnel,
            ...step,
          }),
        ]);
        break;
      } else {
        renderEntires.push([
          step.id,
          step.step,
          stepRender.render({
            ...funnel,
            ...step,
          }),
        ]);
      }
    }
    renderEntires = renderEntires.slice().reverse();
    renderEntires.push([funnel.id, funnel.step, render.render(funnel)]);
  }

  return (
    <Fragment>
      {renderEntires.map(([id, step, element]) => (
        <Fragment key={id}>{element}</Fragment>
      ))}
    </Fragment>
  );
}
