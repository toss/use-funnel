import { useRouter } from 'next/router';

export const keywords = {
  step: {
    ko: '사용자가 하나의 목표를 위해 여러 화면에 걸쳐서 필요한 값을 입력할 때, 각 화면이 step이에요.',
    en: 'When a user performs an input value for one action across multiple screens, each screen is called a "step".',
  },
  context: {
    ko: '각 step에서 입력한 값의 상태에요.',
    en: 'It is a state that stores the input values required for each step.',
  },
  history: {
    ko: '전체 step의 이동과 각 step에서 입력한 context의 변경 기록을 가지고 있는 배열이에요.',
    en: 'It is an array that contains the movement of steps in the funnel and the history of context changes in each Step.',
  },
} satisfies Record<
  string,
  {
    ko: string;
    en: string;
  }
>;

export function Keyword({ children: keyword }: { children: keyof typeof keywords }) {
  const router = useRouter();
  return (
    <mark
      data-tooltip-content={keywords[keyword][router.locale as 'ko' | 'en']}
      data-tooltip-place="top"
      data-tooltip-delay-show={300}
      className="keyword-tooltip font-bold bg-transparent text-current underline underline-offset-4 decoration-[3px] decoration-slate-600 cursor-help"
    >
      {keyword}
    </mark>
  );
}

export function KeywordDescription({ keyword }: { keyword: keyof typeof keywords }) {
  const router = useRouter();
  return <>{keywords[keyword][router.locale as 'ko' | 'en']}</>;
}
