import React from "react";
import { CompareMergeContext } from "./typeUtil";

type EventObject = { type: string; payload: any };

interface State<TName extends string | number | symbol, TContext = never> {
  name: TName;
  context: TContext;
}

type StateRenderResult<
  TState extends State<any, any>,
  TNextState extends State<any, any>,
  TEvent extends EventObject
> = {};

type StateRender<
  TState extends State<any, any>,
  TNextState extends State<any, any>,
  TEvent extends EventObject
> = (
  renderFn: (_: {
    context: TState["context"];
    transition: (target: TNextState["name"]) => void;
    dispatch: (event: TEvent) => void;
  }) => React.ReactNode
) => StateRenderResult<TState, TNextState, TEvent>;

type TransitionFn<
  TState extends State<any, any>,
  TNextState extends State<any, any>
> = <TName extends TNextState["name"]>(
  target: TName,
  context: CompareMergeContext<
    TState["context"],
    Extract<TNextState, { name: TName }>["context"]
  >
) => void;

interface Step<
  TState extends State<any, any>,
  TNextState extends State<any, any>,
  TEvent extends EventObject = never
> {
  on: <TEventName extends string, TPayload>(
    eventName: TEventName,
    handler: (
      payload: TPayload,
      _: {
        context: TState["context"];
        transition: TransitionFn<TState, TNextState>;
      }
    ) => void
  ) => Step<
    TState,
    TNextState,
    TEvent | { type: TEventName; payload: TPayload }
  >;
  events: <
    TEventObjectAssign extends Record<
      string,
      (
        payload: any,
        _: {
          context: TState["context"];
          transition: TransitionFn<TState, TNextState>;
        }
      ) => void
    >
  >(
    _: TEventObjectAssign
  ) => Step<
    TState,
    TNextState,
    | TEvent
    | {
        [key in keyof TEventObjectAssign]: key extends string
          ? {
              type: key;
              payload: Parameters<TEventObjectAssign[key]>[0];
            }
          : never;
      }[keyof TEventObjectAssign]
  >;
  render: StateRender<TState, TNextState, TEvent>;
}

type CreateStep<
  TState extends State<any, any>,
  TNextState extends State<any, any>
> = (
  state: Step<TState, TNextState>
) => StateRenderResult<TState, TNextState, any>; // RenderType return fix

export declare function createUseFunnel<
  TStepContextMap extends Record<string, any>
>(): <
  Steps extends {
    [StepKey in keyof TStepContextMap]: CreateStep<
      State<StepKey, TStepContextMap[StepKey]>,
      {
        [NextStepKey in Exclude<keyof TStepContextMap, StepKey>]: State<
          NextStepKey,
          TStepContextMap[NextStepKey]
        >;
      }[Exclude<keyof TStepContextMap, StepKey>]
    >;
  }
>(_: {
  steps: Steps;
  initial: {
    [key in keyof TStepContextMap]: {
      step: key;
      context: TStepContextMap[key];
    };
  }[keyof TStepContextMap];
}) => React.ReactNode;
