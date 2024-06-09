import { CompareMergeContext } from './typeUtil.js';

export type AnyContext = Record<string, unknown>;
export type AnyStepContextMap = Record<string, AnyContext>;

export interface FunnelState<TName extends string, TContext = never> {
  step: TName;
  context: TContext;
}

export type AnyFunnelState = FunnelState<string, AnyContext>;

type TransitionFnArguments<TName extends PropertyKey, TContext> =
  Partial<TContext> extends TContext ? [target: TName, context?: TContext] : [target: TName, context: TContext];

type TransitionFn<TState extends AnyFunnelState, TNextState extends AnyFunnelState> = <
  TName extends TNextState['step'],
>(
  ...args: TransitionFnArguments<
    TName,
    CompareMergeContext<TState['context'], Extract<TNextState, { step: TName }>['context']>
  >
) => Promise<TNextState>;

export type FunnelStateByContextMap<TStepContextMap extends AnyStepContextMap> = {
  [key in keyof TStepContextMap & string]: FunnelState<key, TStepContextMap[key]>;
}[keyof TStepContextMap & string];

export type FunnelTransition<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
> = TransitionFn<
  FunnelState<TStepKey, TStepContextMap[TStepKey]>,
  {
    [NextStepKey in Exclude<keyof TStepContextMap, TStepKey> & string]: FunnelState<
      NextStepKey,
      TStepContextMap[NextStepKey]
    >;
  }[Exclude<keyof TStepContextMap, TStepKey> & string]
>;

export interface FunnelHistory<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap & string,
> {
  push: FunnelTransition<TStepContextMap, TStepKey>;
  replace: FunnelTransition<TStepContextMap, TStepKey>;
}

export type FunnelStep<TStepContextMap extends AnyStepContextMap, TStepKey extends keyof TStepContextMap & string> = {
  step: TStepKey;
  context: TStepContextMap[TStepKey];
  history: FunnelHistory<TStepContextMap, TStepKey>;
  beforeSteps: FunnelState<keyof TStepContextMap & string, TStepContextMap[keyof TStepContextMap]>[];
};

export type FunnelStepByContextMap<TStepContextMap extends AnyStepContextMap> = {
  [key in keyof TStepContextMap & string]: FunnelStep<TStepContextMap, key>;
}[keyof TStepContextMap & string];
