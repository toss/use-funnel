import { FunnelRouterTransitionOption } from './router.js';
import { CompareMergeContext } from './typeUtil.js';

export type AnyContext = Record<string, unknown>;
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

type TransitionFnArguments<TName extends PropertyKey, TContext> =
  Partial<TContext> extends TContext
    ? [target: TName, context?: TContext, option?: FunnelRouterTransitionOption]
    : [target: TName, context: TContext, option?: FunnelRouterTransitionOption];

type TransitionFn<TState extends AnyFunnelState, TNextState extends AnyFunnelState> = <
  TName extends TNextState['step'],
>(
  ...args: TransitionFnArguments<
    TName,
    CompareMergeContext<TState['context'], GetFunnelStateByName<TNextState, TName>['context']>
  >
) => Promise<GetFunnelStateByName<TNextState, TName>>;

export type FunnelStateByContextMap<TStepContextMap extends AnyStepContextMap> = {
  [key in keyof TStepContextMap & string]: FunnelState<key, TStepContextMap[key]>;
}[keyof TStepContextMap & string];

export type FunnelTransition<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
> = TransitionFn<
  FunnelState<TStepKey, TStepContextMap[TStepKey]>,
  {
    [NextStepKey in keyof TStepContextMap & string]: FunnelState<NextStepKey, TStepContextMap[NextStepKey]>;
  }[keyof TStepContextMap & string]
>;

export interface FunnelHistory<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
> {
  push: FunnelTransition<TStepContextMap, TStepKey>;
  replace: FunnelTransition<TStepContextMap, TStepKey>;
  go: (index: number) => void | Promise<void>;
  back: () => void | Promise<void>;
}

interface GlobalFunnelHistory<TStepContextMap extends AnyStepContextMap> {
  push: FunnelTransition<TStepContextMap, keyof TStepContextMap & string>;
  replace: FunnelTransition<TStepContextMap, keyof TStepContextMap & string>;
}

export type FunnelStep<TStepContextMap extends AnyStepContextMap, TStepKey extends keyof TStepContextMap & string> = {
  step: TStepKey;
  context: TStepContextMap[TStepKey];
  history: FunnelHistory<TStepContextMap, TStepKey>;
  index: number;
  historySteps: FunnelState<keyof TStepContextMap & string, TStepContextMap[keyof TStepContextMap]>[];
};

export type FunnelStepByContextMap<TStepContextMap extends AnyStepContextMap> = {
  [key in keyof TStepContextMap & string]: FunnelStep<TStepContextMap, key>;
}[keyof TStepContextMap & string] & {
  history: GlobalFunnelHistory<TStepContextMap>;
};
