'use client';

import { useFunnel } from '@use-funnel/browser';

export const SubFunnel = ({ mainNext }: { mainNext: () => void }) => {
  const funnel = useFunnel<FunnelState>({ id: FUNNEL_ID, initial: { step: 'start', context: {} } });
  return (
    <div style={{ border: '1px solid red', padding: '10px', backgroundColor: 'lightgray' }}>
      <funnel.Render
        start={({ history }) => (
          <div>
            <p>Sub Start</p>

            <button onClick={() => history.push('end')}>next</button>
          </div>
        )}
        end={() => (
          <div>
            <p>Sub End</p>

            <button onClick={() => mainNext()}>next</button>
          </div>
        )}
      />
    </div>
  );
};

const FUNNEL_ID = 'test-app-router-sub-funnel';

type StartProps = {};
type EndProps = {};

type FunnelState = {
  start: StartProps;
  end: EndProps;
};
