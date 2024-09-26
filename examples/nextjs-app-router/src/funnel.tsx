'use client';
import { useFunnel } from '@use-funnel/browser';

export const TestAppRouterFunnel = () => {
  const funnel = useFunnel<FunnelState>({ id: FUNNEL_ID, initial: { step: 'start', context: {} } });
  return (
    <funnel.Render
      start={({ history }) => (
        <div>
          <p>start</p>

          <button onClick={() => history.push('end')}>next</button>
        </div>
      )}
      end={() => <div>end</div>}
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
