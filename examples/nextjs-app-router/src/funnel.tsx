'use client';
import { useFunnel } from '@use-funnel/browser';
import { SubFunnel } from './sub-funnel';

export const TestAppRouterFunnel = () => {
  const funnel = useFunnel<FunnelState>({ id: FUNNEL_ID, initial: { step: 'start', context: {} } });
  return (
    <funnel.Render
      start={({ history }) => (
        <div>
          <p>MAIN - START</p>
          <SubFunnel mainNext={() => history.push('end')} />
        </div>
      )}
      end={({ history }) => (
        <div>
          <p>MAIN - END</p>
          <SubFunnel mainNext={() => history.push('start')} />
        </div>
      )}
    />
  );
};

const FUNNEL_ID = 'test-app-router-funnel';

type StartProps = {};
type EndProps = {};

type FunnelState = {
  start: StartProps;
  end: EndProps;
};
