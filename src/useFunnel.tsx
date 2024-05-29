import React from "react";

import { CompareMergeContext } from "./typeUtil.js";

type EventObject = { type: string };

interface State<TName extends string | number | symbol, TContext = never> {
  name: TName;
  context: TContext;
}

type TransitionFnArguments<
  TName extends string,
  TContext
> = Partial<TContext> extends TContext
  ? [target: TName, context?: TContext]
  : [target: TName, context: TContext];

type TransitionFn<
  TState extends State<any, any>,
  TNextState extends State<any, any>
> = <TName extends TNextState["name"]>(
  ...args: TransitionFnArguments<
    TName,
    CompareMergeContext<
      TState["context"],
      Extract<TNextState, { name: TName }>["context"]
    >
  >
) => StepTransitionAction<TNextState>;

type StepTransitionAction<TState extends State<any, any>> = {
  type: "TRANSITION";
  state: TState;
};

type RenderFunction<
  TStepContextMap extends Record<string, any>,
  TStepKey extends keyof TStepContextMap
> = (_: {
  context: TStepContextMap[TStepKey];
  transition: TransitionFn<
    State<TStepKey, TStepContextMap[TStepKey]>,
    {
      [NextStepKey in Exclude<keyof TStepContextMap, TStepKey>]: State<
        NextStepKey,
        TStepContextMap[NextStepKey]
      >;
    }[Exclude<keyof TStepContextMap, TStepKey>]
  >;
}) => React.ReactElement;

type FunnelComponent<TStepContextMap extends Record<string, any>> =
  React.ComponentType<{
    [StepKey in keyof TStepContextMap]: RenderFunction<
      TStepContextMap,
      StepKey
    >;
  }>;

export declare function useFunnel<
  _TStepContextMap extends Record<string, any>,
  TStepKeys extends keyof _TStepContextMap = keyof _TStepContextMap,
  TStepContext extends _TStepContextMap[TStepKeys] = _TStepContextMap[TStepKeys],
  TStepContextMap extends string extends keyof _TStepContextMap
    ? Record<TStepKeys, TStepContext>
    : _TStepContextMap = string extends keyof _TStepContextMap
    ? Record<TStepKeys, TStepContext>
    : _TStepContextMap
>(_: {
  id: string;
  guard?:
    | {
        [TStepName in TStepKeys]: (data: unknown) => TStepContextMap[TStepName];
      };
  steps?: TStepKeys[];
  initial: string extends keyof _TStepContextMap
    ? {
        step: TStepKeys;
        context: TStepContext;
      }
    : {
        [key in TStepKeys]: {
          step: key;
          context: TStepContextMap[key];
        };
      }[TStepKeys];
}): {
  Render: FunnelComponent<TStepContextMap>;
  withEvents: <
    TStepKey extends TStepKeys,
    TEvents extends Record<
      string,
      (
        payload: any,
        options: {
          context: TStepContextMap[TStepKey];
          transition: TransitionFn<
            State<TStepKey, TStepContextMap[TStepKey]>,
            {
              [NextStepKey in Exclude<TStepKeys, TStepKey>]: State<
                NextStepKey,
                TStepContextMap[NextStepKey]
              >;
            }[Exclude<TStepKeys, TStepKey>]
          >;
        }
      ) => void
    >
  >(_: {
    events: TEvents;
    render: (_: {
      context: TStepContextMap[TStepKey];
      dispatch: (
        payload: {
          [key in keyof TEvents]: key extends string
            ? Partial<Parameters<TEvents[key]>[0]> extends Parameters<
                TEvents[key]
              >[0]
              ? { type: key; payload?: Parameters<TEvents[key]>[0] }
              : { type: key; payload: Parameters<TEvents[key]>[0] }
            : never;
        }[keyof TEvents]
      ) => void;
    }) => React.ReactElement;
  }) => RenderFunction<TStepContextMap, TStepKey>;
} & {
  [TStepKey in TStepKeys]: {
    step: TStepKey;
    context: TStepContextMap[TStepKey];
    transition: TransitionFn<
      State<TStepKey, TStepContextMap[TStepKey]>,
      {
        [NextStepKey in Exclude<TStepKeys, TStepKey>]: State<
          NextStepKey,
          TStepContextMap[NextStepKey]
        >;
      }[Exclude<TStepKeys, TStepKey>]
    >;
  };
}[TStepKeys];
