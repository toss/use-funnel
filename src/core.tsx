import { TransitionFn } from "./transition.js";

export type AnyContext = Record<string, any>;
export type AnyStepContextMap = Record<string, AnyContext>;
export type AnyState = State<any, AnyContext>;

export interface State<
  TName extends string | number | symbol,
  TContext = never
> {
  id: string;
  step: TName;
  context: TContext;
}

export type FunnelTransition<
  TStepContextMap extends AnyStepContextMap,
  TStepKey extends keyof TStepContextMap
> = TransitionFn<
  State<TStepKey, TStepContextMap[TStepKey]>,
  {
    [NextStepKey in Exclude<keyof TStepContextMap, TStepKey>]: State<
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
  id: string;
  step: TStepKey;
  context: TStepContextMap[TStepKey];
  history: FunnelHistory<TStepContextMap, TStepKey>;
  beforeSteps: State<
    keyof TStepContextMap,
    TStepContextMap[keyof TStepContextMap]
  >[];
};
