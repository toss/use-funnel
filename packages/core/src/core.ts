import { FunnelRouterTransitionOption } from './router.js';
import { CompareMergeContext } from './typeUtil.js';

export type AnyContext = Record<string, any>;
export type AnyStepContextMap = Record<string, AnyContext>;

export interface FunnelState<TName extends string, TContext = never> {
  step: TName;
  context: TContext;
}

export type AnyFunnelState = FunnelState<string, AnyContext>;
export type GetFunnelStateByName<TFunnelState extends AnyFunnelState, TName extends TFunnelState['step']> = Extract<
  TFunnelState,
  { step: TName }
>;

export type RouteOption = Partial<Record<string, any>>;

type TransitionFnArguments<TName extends PropertyKey, TContext, TRouteOption extends RouteOption> =
  Partial<TContext> extends TContext
    ? [target: TName, context?: TContext, option?: FunnelRouterTransitionOption & TRouteOption]
    : [target: TName, context: TContext, option?: FunnelRouterTransitionOption & TRouteOption];

type TransitionFn<
  TState extends AnyFunnelState,
  TNextState extends AnyFunnelState,
  TRouteOption extends RouteOption,
> = <TName extends TNextState['step']>(
  ...args:
    | TransitionFnArguments<
        TName,
        CompareMergeContext<TState['context'], GetFunnelStateByName<TNextState, TName>['context']>,
        TRouteOption
      >
    | [
        target: TName,
        callback: (prev: TState['context']) => GetFunnelStateByName<TNextState, TName>['context'],
        option?: FunnelRouterTransitionOption & TRouteOption,
      ]
) => Promise<GetFunnelStateByName<TNextState, TName>>;

export type FunnelStateByContextMap<TStepContextMap extends AnyStepContextMap> = {
  [key in keyof TStepContextMap & string]: FunnelState<key, TStepContextMap[key]>;
}[keyof TStepContextMap & string];

export type FunnelTransition<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TRouteOption extends RouteOption,
> = TransitionFn<
  FunnelState<TStepKey, TStepContextMap[TStepKey]>,
  {
    [NextStepKey in keyof TStepContextMap & string]: FunnelState<NextStepKey, TStepContextMap[NextStepKey]>;
  }[keyof TStepContextMap & string],
  TRouteOption
>;

export interface FunnelHistory<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TRouteOption extends RouteOption,
> {
  push: FunnelTransition<TStepContextMap, TStepKey, TRouteOption>;
  replace: FunnelTransition<TStepContextMap, TStepKey, TRouteOption>;
  go: (index: number) => void | Promise<void>;
  back: () => void | Promise<void>;
}

interface GlobalFunnelHistory<TStepContextMap extends AnyStepContextMap, TRouteOption extends RouteOption> {
  push: FunnelTransition<TStepContextMap, keyof TStepContextMap & string, TRouteOption>;
  replace: FunnelTransition<TStepContextMap, keyof TStepContextMap & string, TRouteOption>;
}

export type FunnelStep<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
  TRouteOption extends RouteOption,
> = {
  step: TStepKey;
  context: TStepContextMap[TStepKey];
  history: FunnelHistory<TStepContextMap, TStepKey, TRouteOption>;
  index: number;
  historySteps: FunnelState<keyof TStepContextMap & string, TStepContextMap[keyof TStepContextMap]>[];
};

export type FunnelStepByContextMap<TStepContextMap extends AnyStepContextMap, TRouteOption extends RouteOption> = {
  [key in keyof TStepContextMap & string]: FunnelStep<TStepContextMap, key, TRouteOption>;
}[keyof TStepContextMap & string] & {
  history: GlobalFunnelHistory<TStepContextMap, TRouteOption>;
};
