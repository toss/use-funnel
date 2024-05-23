import { createUseFunnel } from "../src";

const useMyFunnel = createUseFunnel<{
  이름_입력: { 이름?: string };
  주민등록번호_입력: { 이름: string };
  휴대폰번호_입력: { 이름: string; 주민등록번호: string };
}>();

export function App() {
  return useMyFunnel({
    initial: {
      step: "이름_입력",
      context: {},
    },
    steps: {
      이름_입력: (step) =>
        step
          .events({
            이름_입력_완료(payload: { 이름: string }, { transition }) {
              return transition("주민등록번호_입력", {
                이름: payload.이름,
              });
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
      주민등록번호_입력: (step) =>
        step
          .events({
            주민등록번호_입력_완료(payload: { value: string }, { transition }) {
              return transition("휴대폰번호_입력", {
                주민등록번호: payload.value,
              });
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
                />
              </div>
            );
          }),
      휴대폰번호_입력: (step) =>
        step.render(({ context }) => {
          return (
            <div>
              <p>이름: {context.이름.toString()}</p>
              <p>주민등록번호: {context.주민등록번호.toString()}</p>
            </div>
          );
        }),
    },
  });
}
