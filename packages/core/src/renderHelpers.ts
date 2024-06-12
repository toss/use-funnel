import { AnyStepContextMap, FunnelStep } from './core';
import { RenderResult } from './FunnelRender';

type EventObject = { type: string; payload: never };

export class StepRenderHelper<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TEvent extends EventObject = never,
> {
  protected listeners: Record<string, (payload: any, state: FunnelStep<TStepContextMap, TStepKey>) => void> = {};
  protected overlay: boolean = false;

  on<TName extends string, TPayload extends never>(
    name: TName,
    callback: (payload: TPayload, state: FunnelStep<TStepContextMap, TStepKey>) => void,
  ): StepRenderHelper<TStepContextMap, TStepKey, TEvent | { type: TName; payload: TPayload }> {
    this.listeners[name] = callback;
    return this as any;
  }

  setOverlay(overlay: boolean) {
    this.overlay = overlay;
  }

  render(
    callback: TEvent extends never
      ? (state: FunnelStep<TStepContextMap, TStepKey>) => React.ReactNode
      : (state: {
          context: FunnelStep<TStepContextMap, TStepKey>['context'];
          dispatch: (
            ...payload: {
              [key in TEvent['type']]: Partial<Extract<TEvent, { type: key }>['payload']> extends Extract<
                TEvent,
                { type: key }
              >['payload']
                ? [type: key, payload?: Extract<TEvent, { type: key }>['payload']]
                : [type: key, payload: Extract<TEvent, { type: key }>['payload']];
            }[TEvent['type']]
          ) => void;
        }) => React.ReactNode,
  ): RenderResult<TStepContextMap, TStepKey> {
    return {
      type: this.overlay ? 'overlay' : 'render',
      render: (step: FunnelStep<TStepContextMap, TStepKey>) => {
        return callback({
          context: step.context,
          dispatch: (type, payload) => {
            if (type in this.listeners) {
              this.listeners[type](payload ?? ({} as never), step);
            }
          },
        });
      },
    };
  }
}

interface StepRenderOption<TStepContextMap extends AnyStepContextMap, TStepKey extends keyof TStepContextMap & string> {
  overlay?: boolean;
  events?: never;
  render: (state: FunnelStep<TStepContextMap, TStepKey>) => React.ReactNode;
}

interface StepRenderOptionWithEvents<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TEvents extends Record<string, (payload: never, step: FunnelStep<TStepContextMap, TStepKey>) => void>,
> {
  overlay?: boolean;
  events: TEvents;
  render: (_: {
    context: FunnelStep<TStepContextMap, TStepKey>['context'];
    dispatch: (
      ...args: {
        [key in keyof TEvents]: key extends string
          ? Partial<Parameters<TEvents[key]>[0]> extends Parameters<TEvents[key]>[0]
            ? [type: key, payload?: Parameters<TEvents[key]>[0]]
            : [type: key, payload: Parameters<TEvents[key]>[0]]
          : never;
      }[keyof TEvents]
    ) => void;
  }) => React.ReactNode;
}

export function with$<TStepContextMap extends AnyStepContextMap, TStepKey extends keyof TStepContextMap & string>(
  option: StepRenderOption<TStepContextMap, TStepKey>,
): RenderResult<TStepContextMap, TStepKey>;
export function with$<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TEvents extends Record<string, (payload: never, step: FunnelStep<TStepContextMap, TStepKey>) => void>,
>(options: StepRenderOptionWithEvents<TStepContextMap, TStepKey, TEvents>): RenderResult<TStepContextMap, TStepKey>;

export function with$<TStepContextMap extends AnyStepContextMap, TStepKey extends keyof TStepContextMap & string>(
  options: StepRenderOption<TStepContextMap, TStepKey> | StepRenderOptionWithEvents<TStepContextMap, TStepKey, any>,
): RenderResult<TStepContextMap, TStepKey> {
  const step = new StepRenderHelper<TStepContextMap, TStepKey>();
  const events: StepRenderOptionWithEvents<TStepContextMap, TStepKey, any>['events'] | undefined = (options as any)
    .events;
  if (events != null) {
    for (const [name, listener] of Object.entries(events)) {
      step.on(name, listener as any);
    }
  }
  if (options.overlay != null) {
    step.setOverlay(options.overlay);
  }
  return step.render(options.render as never);
}
