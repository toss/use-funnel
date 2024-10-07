'use client';

import { useFunnel } from '@use-funnel/next-app-router';
import { SchoolInput } from './SchoolInput';
import { StartDate } from './StartDate';

export const OverlayFunnel = () => {
  const funnel = useFunnel<{
    SelectSchool: { school?: string };
    StartDate: { school: string; startDate?: string };
    Confirm: { school: string; startDate: string };
  }>({ id: 'general', initial: { context: {}, step: 'SelectSchool' } });

  return (
    <funnel.Render
      SelectSchool={({ history }) => <SchoolInput onNext={(school) => history.push('StartDate', { school: school })} />}
      StartDate={funnel.Render.overlay({
        render: ({ history, context }) => (
          <StartDate
            startDate={context.startDate}
            onNext={(startDate) => history.push('Confirm', { school: context.school, startDate: startDate })}
          />
        ),
      })}
      Confirm={({ context }) => (
        <div>
          <div>school: {context.school}</div>
          <div>startDate: {context.startDate}</div>
        </div>
      )}
    />
  );
};
