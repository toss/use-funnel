'use client';
import { useFunnel } from '@use-funnel/next-app-router';
import { useRouter } from 'next/navigation';

export const TestAppRouterFunnel = () => {
  const funnel = useFunnel<FunnelState>({ id: FUNNEL_ID, initial: { step: 'start', context: {} } });
  const router = useRouter();
  return (
    <>
      <funnel.Render
        start={({ history }) => (
          <div>
            <p>start</p>
            <button onClick={() => history.push('end')}>next</button>
          </div>
        )}
        end={() => <div>end</div>}
      />
      <button onClick={() => router.push('/overlay')}>navigate to overlay funnel</button>
    </>
  );
};

const FUNNEL_ID = 'test-app-router-funnel';

type StartProps = {};
type EndProps = {};

type FunnelState = {
  start: StartProps;
  end: EndProps;
};
