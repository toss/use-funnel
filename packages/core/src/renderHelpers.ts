import { AnyStepContextMap, FunnelStep, RouteOption } from './core.js';
import { FunnelRenderOverlayHandler, RenderResult } from './FunnelRender.js';

type EventObject = { type: string; payload: never };
type OverlayRenderArgument<TOverlayEnable extends boolean> = TOverlayEnable extends true
  ? FunnelRenderOverlayHandler
  : {};

type FunnelRenderCallback<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TEnableOverlay extends boolean,
  TRouteOption extends RouteOption,
> = (
  state: FunnelStep<TStepContextMap, TStepKey, TRouteOption> & OverlayRenderArgument<TEnableOverlay>,
) => React.ReactNode;

type FunnelEventRenderCallback<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TOverlayEnable extends boolean,
  TRouteOption extends RouteOption,
  TEvents extends Record<string, (payload: never, step: FunnelStep<TStepContextMap, TStepKey, TRouteOption>) => void>,
> = (
  state: Omit<FunnelStep<TStepContextMap, TStepKey, TRouteOption>, 'history'> & {
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
  TRouteOption extends RouteOption,
  TEvent extends EventObject = never,
> {
  protected listeners: Record<
    string,
    (payload: any, state: FunnelStep<TStepContextMap, TStepKey, TRouteOption>) => void
  > = {};
  protected overlay: boolean = false;

  on<TName extends string, TPayload extends never>(
    name: TName,
    callback: (payload: TPayload, state: FunnelStep<TStepContextMap, TStepKey, TRouteOption>) => void,
  ): StepRenderHelper<TStepContextMap, TStepKey, TEvent | { type: TName; payload: TPayload }> {
    this.listeners[name] = callback;
    return this as any;
  }

  setOverlay(overlay: boolean) {
    this.overlay = overlay;
  }

  render(
    callback: TEvent extends never
      ? FunnelRenderCallback<TStepContextMap, TStepKey, true, TRouteOption>
      : FunnelEventRenderCallback<
        TStepContextMap,
        TStepKey,
        true,
        TRouteOption,
        {
          [key in TEvent['type']]: (
            payload: Extract<TEvent, { type: key }>['payload'],
            state: FunnelStep<TStepContextMap, TStepKey, TRouteOption>,
          ) => void;
        }
      >,
  ): RenderResult<TStepContextMap, TStepKey, TRouteOption> {
    return {
      type: this.overlay ? 'overlay' : 'render',
      render: (step: FunnelStep<TStepContextMap, TStepKey, TRouteOption>) => {
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
  TRouteOption extends RouteOption,
  TEvents extends Record<string, (payload: never, step: FunnelStep<TStepContextMap, TStepKey, TRouteOption>) => void>,
>(option: {
  overlay?: TOverlayEnable;
  events: TEvents;
  render: FunnelEventRenderCallback<TStepContextMap, TStepKey, TOverlayEnable, TRouteOption, TEvents>;
}): RenderResult<TStepContextMap, TStepKey, TRouteOption>;

// without event render
export function renderWith<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TOverlayEnable extends boolean,
  TRouteOption extends RouteOption,
>(option: {
  overlay?: TOverlayEnable;
  events?: never;
  render: FunnelRenderCallback<TStepContextMap, TStepKey, TOverlayEnable, TRouteOption>;
}): RenderResult<TStepContextMap, TStepKey, TRouteOption>;

export function renderWith<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TOverlayEnable extends boolean,
  TRouteOption extends RouteOption,
  TEvents extends Record<string, (payload: never, step: FunnelStep<TStepContextMap, TStepKey, TRouteOption>) => void>,
>(option: {
  overlay?: TOverlayEnable;
  events?: TEvents;
  render: TEvents extends never
  ? FunnelRenderCallback<TStepContextMap, TStepKey, TOverlayEnable, TRouteOption>
  : FunnelEventRenderCallback<TStepContextMap, TStepKey, TOverlayEnable, TRouteOption, TEvents>;
}) {
  const step = new StepRenderHelper<TStepContextMap, TStepKey, TRouteOption>();
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
  TRouteOption extends RouteOption,
  TEvents extends Record<string, (payload: never, step: FunnelStep<TStepContextMap, TStepKey, TRouteOption>) => void>,
>(option: {
  events: TEvents;
  render: FunnelEventRenderCallback<TStepContextMap, TStepKey, true, TRouteOption, TEvents>;
}): RenderResult<TStepContextMap, TStepKey, TRouteOption>;

// without event render
export function overlayRenderWith<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TRouteOption extends RouteOption,
>(option: {
  events?: never;
  render: FunnelRenderCallback<TStepContextMap, TStepKey, true, TRouteOption>;
}): RenderResult<TStepContextMap, TStepKey, TRouteOption>;

export function overlayRenderWith<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TRouteOption extends RouteOption,
  TEvents extends Record<string, (payload: never, step: FunnelStep<TStepContextMap, TStepKey, TRouteOption>) => void>,
>(option: {
  events?: any;
  render: TEvents extends never
  ? FunnelRenderCallback<TStepContextMap, TStepKey, true, TRouteOption>
  : FunnelEventRenderCallback<TStepContextMap, TStepKey, true, TRouteOption, TEvents>;
}) {
  return renderWith({
    ...option,
    overlay: true,
  } as never);
}
