import React, { useCallback, useMemo, useRef, useState } from "react";
import { useOverlay } from "@tossteam/use-overlay";

import { CompareMergeContext } from "./typeUtil.js";

type EventObject = { type: string };

interface State<TName extends string | number | symbol, TContext = never> {
  name: TName;
  context: TContext;
}

type StateRenderResult<
  TState extends State<any, any>,
  TNextState extends State<any, any>,
  TEvent extends EventObject
> =
  | {
      type: "RENDER";
      render: Parameters<StateRender<TState, TNextState, TEvent>>[0];
      eventHandlers: Record<string, StepEventHandler<TState, TNextState, any>>;
    }
  | {
      type: "OVERLAY";
      render: Parameters<
        StateRender<
          TState,
          TNextState,
          TEvent,
          Parameters<Parameters<ReturnType<typeof useOverlay>["open"]>[0]>[0]
        >
      >[0];
      eventHandlers: Record<string, StepEventHandler<TState, TNextState, any>>;
    };

type StateRender<
  TState extends State<any, any>,
  TNextState extends State<any, any>,
  TEvent extends EventObject,
  TFnArgs = {}
> = (
  renderFn: (
    _: TFnArgs & {
      context: TState["context"];
      transition: TransitionFn<TState, TNextState>;
      dispatch: (event: TEvent) => void;
    }
  ) => React.ReactNode
) => StateRenderResult<TState, TNextState, TEvent>;

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

type StepSetStateAction<TState extends State<any, any>> = {
  type: "SET_STATE";
  state: TState;
};

type StepAction<TState extends State<any, any>> =
  | StepTransitionAction<TState>
  | StepSetStateAction<TState>;

type StepEventHandler<
  TState extends State<any, any>,
  TNextState extends State<any, any>,
  TPayload
> = (
  payload: TPayload,
  _: {
    context: TState["context"];
    transition: TransitionFn<TState, TNextState>;
  }
) => StepAction<TState | TNextState>;

interface Step<
  TState extends State<any, any>,
  TNextState extends State<any, any>,
  TEvent extends EventObject = never
> {
  name: TState["name"];
  context: TState["context"];
  on<TEventName extends string, TPayload>(
    eventName: TEventName,
    handler: StepEventHandler<TState, TNextState, TPayload>
  ): Step<
    TState,
    TNextState,
    | TEvent
    | (TPayload extends never
        ? { type: TEventName }
        : { type: TEventName; payload: TPayload })
  >;
  on<
    TEventObjectAssign extends Record<
      string,
      StepEventHandler<TState, TNextState, any>
    >
  >(
    _: TEventObjectAssign
  ): Step<
    TState,
    TNextState,
    | TEvent
    | {
        [key in keyof TEventObjectAssign]: key extends string
          ? Parameters<TEventObjectAssign[key]>[0] extends never
            ? {
                type: key;
              }
            : {
                type: key;
                payload: Parameters<TEventObjectAssign[key]>[0];
              }
          : never;
      }[keyof TEventObjectAssign]
  >;
  render: StateRender<TState, TNextState, TEvent>;
  overlay: StateRender<
    TState,
    TNextState,
    TEvent,
    Parameters<Parameters<ReturnType<typeof useOverlay>["open"]>[0]>[0]
  >;
}

type CreateStep<
  TState extends State<any, any>,
  TNextState extends State<any, any>
> = (
  state: Step<TState, TNextState>
) => StateRenderResult<TState, TNextState, any>; // RenderType return fix

type ComplexUseFunnel<TStepContextMap extends Record<string, any>> = <
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
  setup: Steps;
  initial: {
    [key in keyof TStepContextMap]: {
      step: key;
      context: TStepContextMap[key];
    };
  }[keyof TStepContextMap];
}) => React.ReactNode;

type SimpleUseFunnel<TSteps extends string[]> = <
  TContext,
  Steps extends {
    [StepKey in TSteps[number]]: CreateStep<
      State<StepKey, TContext>,
      {
        [NextStepKey in Exclude<TSteps[number], StepKey>]: State<
          NextStepKey,
          TContext
        >;
      }[Exclude<TSteps[number], StepKey>]
    >;
  }
>(_: {
  setup: Steps;
  initial: {
    step: TSteps[number];
    context: TContext;
  };
}) => React.ReactNode;

export declare function createUseFunnel<
  TStepContextMap extends Record<string, any>
>(stepGuard?: {
  [TStepName in keyof TStepContextMap]: (
    data: unknown
  ) => TStepContextMap[TStepName];
}): ComplexUseFunnel<TStepContextMap>;

export declare function createUseFunnel<TStep extends string>(
  steps: TStep[]
): SimpleUseFunnel<TStep[]>;

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
    // | EventRenderObject<TStepContextMap, StepKey, Record<string, () => void>>;
    // [StepKey in keyof TStepContextMap]: CreateStep<
    //   State<StepKey, TStepContextMap[StepKey]>,
    // {
    //   [NextStepKey in Exclude<keyof TStepContextMap, StepKey>]: State<
    //     NextStepKey,
    //     TStepContextMap[NextStepKey]
    //   >;
    // }[Exclude<keyof TStepContextMap, StepKey>]
    // >;
    // [StepKey in keyof TStepContextMap]: () => {
    //   events?: Record<
    //     string,
    //     StepEventHandler<
    //       State<StepKey, TStepContextMap[StepKey]>,
    //       {
    //         [NextStepKey in Exclude<keyof TStepContextMap, StepKey>]: State<
    //           NextStepKey,
    //           TStepContextMap[NextStepKey]
    //         >;
    //       }[Exclude<keyof TStepContextMap, StepKey>],
    //       any
    //     >
    //   >;
    // };
  }>;

// type CreateStepFunction<
//   TStepContextMap extends Record<string, any>,
//   TStep extends keyof TStepContextMap
// > = <TEvents extends Record<string, () => void>>(props: {
//   events: TEvents;
//   render: (props: {
//     context: TStepContextMap[TStep];
//     events: keyof TEvents;
//     name: TStep;
//     dispatch: (
//       event: {
//         [key in keyof TEvents]: key extends string
//           ? { type: key; payload: TEvents }
//           : never;
//       }[keyof TEvents]
//     ) => void;
//   }) => React.ReactElement;
// }) => React.ReactElement;

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
}): FunnelComponent<TStepContextMap> & {
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
};
