import { useRouter } from 'next/router';

export const keywords = {
  step: {
    ko: '사용자가 하나의 동작을 위한 입력값을 여러 화면에 걸쳐서 수행하도록 할 때, 각 화면을 "Step"이라고 불러요.',
    en: 'When a user performs an input value for one action across multiple screens, each screen is called a "Step".',
  },
  context: {
    ko: '각 Step에서 필요한 입력값을 저장하는 상태에요.',
    en: 'It is a state that stores the input values required for each Step.',
  },
  history: {
    ko: '퍼널에서 Step의 이동과 각 Step에서의 Context 변경 내역을 가진 배열이에요.',
    en: 'It is an array that contains the movement of Steps in the funnel and the history of Context changes in each Step.',
  },
} satisfies Record<
  string,
  {
    ko: string;
    en: string;
  }
>;

export function Keyword({ keyword }: { keyword: keyof typeof keywords }) {
  const router = useRouter();
  return (
    <>
      <mark
        data-tooltip-content={keywords[keyword][router.locale as 'ko' | 'en']}
        data-tooltip-place="top"
        data-tooltip-delay-show={300}
        className="keyword-tooltip font-bold bg-transparent text-white underline underline-offset-4 decoration-4 decoration-slate-600 cursor-help"
      >
        {keyword}
      </mark>
    </>
  );
}

export function KeywordDescription({ keyword }: { keyword: keyof typeof keywords }) {
  const router = useRouter();
  return <>{keywords[keyword][router.locale as 'ko' | 'en']}</>;
}
