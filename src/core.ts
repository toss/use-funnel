import { CompareMergeContext } from "./typeUtil.js";

export type AnyContext = Record<string, any>;
export type AnyStepContextMap = Record<string, AnyContext>;
export type AnyState = FunnelState<any, AnyContext>;

type TransitionFnArguments<
  TName extends string,
  TContext
> = Partial<TContext> extends TContext
  ? [target: TName, context?: TContext]
  : [target: TName, context: TContext];

type TransitionFn<
  TState extends FunnelState<any, any>,
  TNextState extends FunnelState<any, any>
> = <TName extends TNextState["step"]>(
  ...args: TransitionFnArguments<
    TName,
    CompareMergeContext<
      TState["context"],
      Extract<TNextState, { step: TName }>["context"]
    >
  >
) => Promise<TNextState>;

export interface FunnelState<
  TName extends string | number | symbol,
  TContext = never
> {
  step: TName;
  context: TContext;
}

export type FunnelStateByContextMap<TStepContextMap extends AnyStepContextMap> =
  {
    [key in keyof TStepContextMap]: FunnelState<key, TStepContextMap[key]>;
  }[keyof TStepContextMap];

export type FunnelTransition<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap
> = TransitionFn<
  FunnelState<TStepKey, TStepContextMap[TStepKey]>,
  {
    [NextStepKey in Exclude<keyof TStepContextMap, TStepKey>]: FunnelState<
      NextStepKey,
      TStepContextMap[NextStepKey]
    >;
  }[Exclude<keyof TStepContextMap, TStepKey>]
>;

export interface FunnelHistory<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap
> {
  push: FunnelTransition<TStepContextMap, TStepKey>;
  replace: FunnelTransition<TStepContextMap, TStepKey>;
}

export type FunnelStep<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap
> = {
  step: TStepKey;
  context: TStepContextMap[TStepKey];
  history: FunnelHistory<TStepContextMap, TStepKey>;
  beforeSteps: FunnelState<
    keyof TStepContextMap,
    TStepContextMap[keyof TStepContextMap]
  >[];
};

export type FunnelStepByContextMap<TStepContextMap extends AnyStepContextMap> =
  {
    [key in keyof TStepContextMap]: FunnelStep<TStepContextMap, key>;
  }[keyof TStepContextMap];
