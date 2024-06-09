import { AnyStepContextMap, FunnelStep } from './core.js';

type RenderFunction<TStepContextMap extends AnyStepContextMap, TStepKey extends keyof TStepContextMap & string> = (
  funnel: FunnelStep<TStepContextMap, TStepKey>,
) => React.ReactElement;

type WithEventRenderFunction<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TEvents extends Record<string, (payload: never, step: FunnelStep<TStepContextMap, TStepKey>) => void>,
> = (_: {
  context: TStepContextMap[TStepKey];
  dispatch: (
    payload: {
      [key in keyof TEvents]: key extends string
        ? Partial<Parameters<TEvents[key]>[0]> extends Parameters<TEvents[key]>[0]
          ? { type: key; payload?: Parameters<TEvents[key]>[0] }
          : { type: key; payload: Parameters<TEvents[key]>[0] }
        : never;
    }[keyof TEvents],
  ) => void;
}) => React.ReactElement;

export const withEvents: <
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TEvents extends Record<string, (payload: never, step: FunnelStep<TStepContextMap, TStepKey>) => void>,
>(_: {
  events: TEvents;
  render: WithEventRenderFunction<TStepContextMap, TStepKey, TEvents>;
}) => RenderFunction<TStepContextMap, TStepKey> = ({ events, render }) => {
  return (step) => {
    return render({
      context: step.context,
      dispatch: (payload) => {
        if (payload.type in events) {
          events[payload.type](payload.payload ?? ({} as never), step);
        }
      },
    });
  };
};
