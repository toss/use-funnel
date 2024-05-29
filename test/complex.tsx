import { z } from "zod";
import { createUseFunnel } from "../src/index.js";

// const useMyFunnel = createUseFunnel<{
//   이름_입력: { 이름?: string };
//   주민등록번호_입력: { 이름: string };
//   휴대폰번호_입력: { 이름: string; 주민등록번호: string };
// }>();

const Context_Step1 = z.object({
  이름: z.string().optional(),
  주민등록번호: z.string().optional(),
});

const Context_Step2 = Context_Step1.required({
  이름: true,
});

const Context_Step3 = Context_Step2.required({
  주민등록번호: true,
});

const useMyFunnel = createUseFunnel({
  이름_입력: Context_Step1.parse,
  주민등록번호_입력: Context_Step2.parse,
  휴대폰번호_입력: Context_Step3.parse,
  약관동의: Context_Step3.parse,
});

export function App() {
  return useMyFunnel({
    initial: {
      step: "이름_입력",
      context: {},
    },
    setup: {
      이름_입력: (step) =>
        step
          .on("이름_입력_완료", (payload: { 이름: string }, { transition }) => {
            return transition("주민등록번호_입력", {
              이름: payload.이름,
            });
          })
          .overlay(({ dispatch }) => {
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
      주민등록번호_입력: (step) =>
        step
          .on({
            주민등록번호_입력_완료(payload: { value: string }, { transition }) {
              return transition("휴대폰번호_입력", {
                주민등록번호: payload.value,
              });
            },
            주민등록번호_입력_취소(_, { transition }) {
              return transition("이름_입력");
            },
          })
          .render(({ context, dispatch }) => {
            return (
              <div>
                <p>이름: {context.이름.toString()}</p>
                <button
                  onClick={() =>
                    dispatch({
                      type: "주민등록번호_입력_완료",
                      payload: {
                        value: "123456-1234567",
                      },
                    })
                  }
                >
                  완료
                </button>
                <button
                  onClick={() =>
                    dispatch({
                      type: "주민등록번호_입력_취소",
                    })
                  }
                >
                  취소
                </button>
              </div>
            );
          }),
      휴대폰번호_입력: (step) =>
        step.render(({ context, dispatch }) => {
          return (
            <div>
              <p>이름: {context.이름.toString()}</p>
              <p>주민등록번호: {context.주민등록번호.toString()}</p>
            </div>
          );
        }),
      약관동의: (step) => step.overlay(({ context, isOpen, close }) => null),
    },
  });
}
