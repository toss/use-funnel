import { useFunnel } from "../src/index.js";

export function Simple() {
  const Funnel = useFunnel({
    id: "simple-funnel",
    steps: ["이름_입력", "주민등록번호_입력", "휴대폰번호_입력"],
    initial: {
      step: "이름_입력",
      context: {} as {
        이름?: string;
        주민등록번호?: string;
        휴대폰번호?: string;
      },
    },
  });

  return (
    <Funnel
      이름_입력={({ context, transition }) => (
        <button
          onClick={() =>
            transition("주민등록번호_입력", {
              이름: "홍길동",
            })
          }
        />
      )}
      주민등록번호_입력={({ context, transition }) => (
        <button
          onClick={() =>
            transition("휴대폰번호_입력", {
              주민등록번호: "1234",
            })
          }
        />
      )}
      휴대폰번호_입력={({ context, transition }) => <div>끝</div>}
    />
  );
}
