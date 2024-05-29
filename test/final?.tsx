import { useFunnel } from "../src/index.js";

export function App() {
  const Funnel = useFunnel<{
    이름_입력: { 이름?: string };
    주민등록번호_입력: { 이름: string };
    휴대폰번호_입력: { 이름: string; 주민등록번호: string };
    약관동의: { 이름: string; 주민등록번호: string; 휴대폰번호: string };
  }>({
    id: "complex-funnel",
    initial: {
      step: "이름_입력",
      context: {},
    },
  });

  return (
    <Funnel
      // 이름_입력={({ context, transition }) => {
      //   const 이름_입력_완료 = (payload: { 이름: string }) => {
      //     return transition("주민등록번호_입력", {
      //       이름: payload.이름,
      //     });
      //   };

      //   return (
      //     <>
      //       <p>이름: {context.이름}</p>
      //       <button onClick={() => 이름_입력_완료({ 이름: "강민우" })} />
      //     </>
      //   );
      // }}
      이름_입력={Funnel.withEvents({
        events: {
          이름_입력_완료: (payload: { 이름: string }, { transition }) => {
            return transition("주민등록번호_입력", {
              이름: payload.이름,
            });
          },
          이름_입력_실패: (payload: { 이유: string }, { transition }) => {
            throw {};
          },
        },
        render({ context, dispatch }) {
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
        },
      })}
      주민등록번호_입력={Funnel.withEvents({
        events: {
          주민등록번호_입력_완료: (
            payload: { value: string },
            { transition }
          ) => {
            return transition("휴대폰번호_입력", {
              주민등록번호: payload.value,
            });
          },
          주민등록번호_입력_취소: (_, { transition }) => {
            return transition("이름_입력");
          },
        },
        render({ context, dispatch }) {
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
        },
      })}
      휴대폰번호_입력={Funnel.withEvents({
        events: {
          휴대폰번호_입력_완료: (
            payload: { value: string },
            { transition }
          ) => {
            return transition("약관동의", {
              휴대폰번호: payload.value,
            });
          },
          휴대폰번호_입력_취소: (_, { transition }) => {
            return transition("주민등록번호_입력");
          },
        },
        render({ context, dispatch }) {
          return (
            <div>
              <p>이름: {context.이름.toString()}</p>
              <p>주민등록번호: {context.주민등록번호.toString()}</p>
            </div>
          );
        },
      })}
      약관동의={() => {
        // TODO: overlay를 어떻게 구현할까?
        return <div>약관동의</div>;
      }}
    />
  );
}
