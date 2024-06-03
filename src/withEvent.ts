import { AnyStepContextMap, FunnelStep } from "./core.js";

type RenderFunction<
  TStepContextMap extends Record<string, any>,
  TStepKey extends keyof TStepContextMap
> = (funnel: FunnelStep<TStepContextMap, TStepKey>) => React.ReactElement;

type WithEventRenderFunction<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap,
  TEvents extends Record<
    string,
    (payload: any, step: FunnelStep<TStepContextMap, TStepKey>) => void
  >
> = (_: {
  context: TStepContextMap[TStepKey];
  dispatch: (
    payload: {
      [key in keyof TEvents]: key extends string
        ? Partial<Parameters<TEvents[key]>[0]> extends Parameters<
            TEvents[key]
          >[0]
          ? { type: key; payload?: Parameters<TEvents[key]>[0] }
          : { type: key; payload: Parameters<TEvents[key]>[0] }
        : never;
    }[keyof TEvents]
  ) => void;
}) => React.ReactElement;

export const withEvents: <
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap,
  TEvents extends Record<
    string,
    (payload: any, step: FunnelStep<TStepContextMap, TStepKey>) => void
  >
>(_: {
  events: TEvents;
  render: WithEventRenderFunction<TStepContextMap, TStepKey, TEvents>;
}) => RenderFunction<TStepContextMap, TStepKey> = ({ events, render }) => {
  return ({ context, step, history, id, beforeSteps }) => {
    return render({
      context,
      dispatch: (payload) => {
        if (payload.type in events) {
          events[payload.type](payload.payload ?? {}, {
            context,
            step,
            history,
            id,
            beforeSteps,
          });
        }
      },
    });
  };
};
