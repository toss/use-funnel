import { FunnelState } from "./core.js";
import { CompareMergeContext } from "./typeUtil.js";

type TransitionFnArguments<
  TName extends string,
  TContext
> = Partial<TContext> extends TContext
  ? [target: TName, context?: TContext]
  : [target: TName, context: TContext];

export type TransitionFn<
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
