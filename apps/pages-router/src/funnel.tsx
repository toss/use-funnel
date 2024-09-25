import { useFunnel } from '@use-funnel/next';

export const TestPagesRouterFunnel = () => {
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

const FUNNEL_ID = 'test-pages-router-funnel';

type StartProps = {};
type EndProps = {};

type FunnelState = {
  start: StartProps;
  end: EndProps;
};
