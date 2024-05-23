import React from "react";

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

// interface Step<
//   TState extends State<any, any>,
//   TNextState extends State<any, any>
// > {
//   guard?: (data: unknown) => TState["context"];
//   events?: {
//     [name in TEvent["type"]]: (
//       payload: TEvent["payload"],
//       _: {
//         context: TState["context"];
//         transition: (target: TNextState["name"]) => void;
//       }
//     ) => void;
//   };
//   render: StateRender<TState, TNextState, TEvent>;
// }

type A = { type: "A"; payload: number } | { type: "B"; payload: boolean };
type _ = Extract<A, { type: "A" }>["payload"];

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
        transition: (target: TNextState["name"]) => void;
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
          transition: (target: TNextState["name"]) => void;
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
    // | StateRender<
    //     State<StepKey, TStepContextMap[StepKey]>,
    //     {
    //       [NextStepKey in Exclude<keyof TStepContextMap, StepKey>]: State<
    //         NextStepKey,
    //         TStepContextMap[NextStepKey]
    //       >;
    //     }[Exclude<keyof TStepContextMap, StepKey>],
    //     never
    //   >;
  }
>(_: {
  steps: Steps;
}) => void;

const useMyFunnel = createUseFunnel<{
  이름_입력: { 이름?: string };
  주민등록번호_입력: { 이름: string };
  휴대폰번호_입력: { 이름: string; 주민등록번호: string };
}>();

useMyFunnel({
  steps: {
    이름_입력: (step) =>
      step
        // .on(
        //   "이름_입력_완료",
        //   (payload: { 이름: string }, { context, transition }) => {
        //     return transition("주민등록번호_입력");
        //   }
        // )
        // .on("이름_입력_실패", (payload: { error: Error }) => {
        //   throw payload.error;
        // })
        .events({
          이름_입력_완료(payload: { 이름: string }, { context, transition }) {
            return transition("주민등록번호_입력");
          },
        })
        .render(({ dispatch }) => {
          return (
            <button
              onClick={() =>
                dispatch({
                  type: "이름_입력_완료",
                  payload: {
                    이름: "홍길동",
                  },
                })
              }
            />
          );
        }),
    주민등록번호_입력: (state) => state.render(() => null),
    휴대폰번호_입력: (state) => state.render(() => null),
  },
});
