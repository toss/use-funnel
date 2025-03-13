import { useFunnel } from '@use-funnel/next';
import Link from 'next/link';

export const TestPagesRouterFunnel = () => {
  const funnel = useFunnel<FunnelState>({ id: FUNNEL_ID, initial: { step: 'start', context: {} } });
  return (
    <>
      <Link href="/home">Go Home</Link>
      <funnel.Render
        start={({ history }) => (
          <div>
            <h1>start</h1>

            <button onClick={() => history.push('middle')}>next</button>
          </div>
        )}
        middle={({ history }) => {
          return <SubFunnel onNext={() => history.push('end')} />;
        }}
        end={() => <h1>end</h1>}
      />
    </>
  );
};

function SubFunnel({ onNext }: { onNext: () => void }) {
  const funnel = useFunnel<{
    start: StartProps;
    end: EndProps;
  }>({ id: 'sub-funnel', initial: { step: 'start', context: {} } });
  return (
    <div>
      <h1>sub-funnel</h1>
      <funnel.Render
        start={({ history }) => (
          <div>
            <h2>sub start</h2>
            <button onClick={() => history.push('end')}>next</button>
          </div>
        )}
        end={() => (
          <div>
            <h2>sub end</h2>
            <button onClick={() => onNext()}>next</button>
          </div>
        )}
      />
    </div>
  );
}

const FUNNEL_ID = 'test-pages-router-funnel';

type StartProps = {};
type MiddleProps = {};
type EndProps = {};

type FunnelState = {
  start: StartProps;
  middle: MiddleProps;
  end: EndProps;
};
