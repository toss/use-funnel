import { AnyStepContextMap, FunnelStep } from './core';
import { FunnelRenderOverlayHandler, RenderResult } from './FunnelRender';

type EventObject = { type: string; payload: never };
type OverlayRenderArgument<TOverlayEnable extends boolean> = TOverlayEnable extends true
  ? FunnelRenderOverlayHandler
  : {};

type FunnelRenderCallback<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TEnableOverlay extends boolean,
> = (state: FunnelStep<TStepContextMap, TStepKey> & OverlayRenderArgument<TEnableOverlay>) => React.ReactNode;

type FunnelEventRenderCallback<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TOverlayEnable extends boolean,
  TEvents extends Record<string, (payload: never, step: FunnelStep<TStepContextMap, TStepKey>) => void>,
> = (
  state: Omit<FunnelStep<TStepContextMap, TStepKey>, 'history'> & {
    dispatch: (
      ...args: {
        [key in keyof TEvents]: key extends string
          ? Partial<Parameters<TEvents[key]>[0]> extends Parameters<TEvents[key]>[0]
            ? [type: key, payload?: Parameters<TEvents[key]>[0]]
            : [type: key, payload: Parameters<TEvents[key]>[0]]
          : never;
      }[keyof TEvents]
    ) => void;
  } & OverlayRenderArgument<TOverlayEnable>,
) => React.ReactNode;

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
      ? FunnelRenderCallback<TStepContextMap, TStepKey, true>
      : FunnelEventRenderCallback<
          TStepContextMap,
          TStepKey,
          true,
          {
            [key in TEvent['type']]: (
              payload: Extract<TEvent, { type: key }>['payload'],
              state: FunnelStep<TStepContextMap, TStepKey>,
            ) => void;
          }
        >,
  ): RenderResult<TStepContextMap, TStepKey> {
    return {
      type: this.overlay ? 'overlay' : 'render',
      render: (step: FunnelStep<TStepContextMap, TStepKey>) => {
        return callback({
          ...step,
          // event dispatch
          dispatch: (type, payload) => {
            if (type in this.listeners) {
              this.listeners[type](payload ?? ({} as never), step);
            }
          },
          // close overlay action
          close: () => step.history.back(),
        });
      },
    };
  }
}

// with event render
export function renderWith<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TOverlayEnable extends boolean,
  TEvents extends Record<string, (payload: never, step: FunnelStep<TStepContextMap, TStepKey>) => void>,
>(option: {
  overlay?: TOverlayEnable;
  events: TEvents;
  render: FunnelEventRenderCallback<TStepContextMap, TStepKey, TOverlayEnable, TEvents>;
}): RenderResult<TStepContextMap, TStepKey>;

// without event render
export function renderWith<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TOverlayEnable extends boolean,
>(option: {
  overlay?: TOverlayEnable;
  events?: never;
  render: FunnelRenderCallback<TStepContextMap, TStepKey, TOverlayEnable>;
}): RenderResult<TStepContextMap, TStepKey>;

export function renderWith<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TOverlayEnable extends boolean,
  TEvents extends Record<string, (payload: never, step: FunnelStep<TStepContextMap, TStepKey>) => void>,
>(option: {
  overlay?: TOverlayEnable;
  events?: TEvents;
  render: TEvents extends never
    ? FunnelRenderCallback<TStepContextMap, TStepKey, TOverlayEnable>
    : FunnelEventRenderCallback<TStepContextMap, TStepKey, TOverlayEnable, TEvents>;
}) {
  const step = new StepRenderHelper<TStepContextMap, TStepKey>();
  const events = option.events;
  if (events != null) {
    for (const [name, listener] of Object.entries(events)) {
      step.on(name, listener as any);
    }
  }
  if (option.overlay != null) {
    step.setOverlay(option.overlay);
  }
  return step.render(option.render as never);
}

// with event render
export function overlayRenderWith<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TEvents extends Record<string, (payload: never, step: FunnelStep<TStepContextMap, TStepKey>) => void>,
>(option: {
  events: TEvents;
  render: FunnelEventRenderCallback<TStepContextMap, TStepKey, true, TEvents>;
}): RenderResult<TStepContextMap, TStepKey>;

// without event render
export function overlayRenderWith<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
>(option: {
  events?: never;
  render: FunnelRenderCallback<TStepContextMap, TStepKey, true>;
}): RenderResult<TStepContextMap, TStepKey>;

export function overlayRenderWith<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TEvents extends Record<string, (payload: never, step: FunnelStep<TStepContextMap, TStepKey>) => void>,
>(option: {
  events?: any;
  render: TEvents extends never
    ? FunnelRenderCallback<TStepContextMap, TStepKey, true>
    : FunnelEventRenderCallback<TStepContextMap, TStepKey, true, TEvents>;
}) {
  return renderWith({
    ...option,
    overlay: true,
  } as never);
}
