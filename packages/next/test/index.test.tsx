import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { describe, expect, test } from 'vitest';
import { useFunnel } from '../src/index.js';
import { renderWithSuspense } from './utils.js';

describe('Test useFunnel next router', () => {
  test('should work', async () => {
    function FunnelTest() {
      const funnel = useFunnel<{
        A: { id?: string };
        B: { id: string };
        C: { id: string; password: string; date: Date };
      }>({
        id: 'vitest',
        initial: {
          step: 'A',
          context: {},
        },
      });

      switch (funnel.step) {
        case 'A': {
          return (
            <button
              onClick={() => {
                funnel.history.push('B', { id: 'vitest' });
              }}
            >
              Go B
            </button>
          );
        }
        case 'B': {
          return (
            <div>
              <div>{funnel.context.id}</div>
              <button
                onClick={() => {
                  funnel.history.replace('C', { password: 'vitest1234', date: new Date() });
                }}
              >
                Go C
              </button>
            </div>
          );
        }
        case 'C': {
          return (
            <div>
              <div>Finished!</div>
              <p>{funnel.context.date.toISOString()}</p>
            </div>
          );
        }
        default: {
          throw new Error('Invalid step');
        }
      }
    }

    render(<FunnelTest />);

    expect(screen.queryByText('Go B')).not.toBeNull();

    const user = userEvent.setup();
    await user.click(screen.getByText('Go B'));

    expect(screen.queryByText('vitest')).not.toBeNull();
    expect(mockRouter.query['funnel.vitest.step']).toBe('B');
    expect(JSON.parse(mockRouter.query['funnel.vitest.context'] as string)).toEqual({
      id: 'vitest',
    });
    expect(JSON.parse(mockRouter.query['funnel.vitest.histories'] as string)).toEqual([{ step: 'A', context: {} }]);

    await user.click(screen.getByText('Go C'));

    expect(screen.queryByText('Finished!')).not.toBeNull();
    expect(mockRouter.query['funnel.vitest.step']).toBe('C');
    expect(JSON.parse(mockRouter.query['funnel.vitest.histories'] as string)).toEqual([{ step: 'A', context: {} }]);
  });

  describe('should work with suspense option', async () => {
    function FunnelTest() {
      const funnel = useFunnel<{
        A: { id?: string };
        B: { id: string };
        C: { id: string; password: string; date: Date };
      }>({
        id: 'vitest',
        initial: {
          step: 'A',
          context: {},
        },
        suspense: true,
      });

      switch (funnel.step) {
        case 'A': {
          return <div>A</div>;
        }
        case 'B': {
          return <div>B</div>;
        }
        case 'C': {
          return <div>C</div>;
        }
        default: {
          throw new Error('Invalid step');
        }
      }
    }

    test('does not have the query parameter value when `isReady: false`', () => {
      mockRouter.isReady = false;

      const { checkDidSuspend, withSuspense } = renderWithSuspense();
      render(withSuspense(<FunnelTest />, { fallback: null }));
      expect(checkDidSuspend()).toBe(true);
    });

    test('returns the correct query parameter value when `isReady: true`', async () => {
      mockRouter.isReady = false;

      const { checkDidSuspend, withSuspense } = renderWithSuspense();

      const FunnelWithSuspense = withSuspense(<FunnelTest />, { fallback: <div>fallback</div> });
      const page = render(FunnelWithSuspense);

      // set isReady true and rerender page
      const timer = setTimeout(() => {
        mockRouter.isReady = true;
        page.rerender(FunnelWithSuspense);
        clearTimeout(timer);
      }, 1000);

      expect(screen.queryByText('fallback')).not.toBeNull();

      await waitFor(() => {
        expect(screen.queryByText('C')).not.toBeNull();
        expect(mockRouter.query['funnel.vitest.step']).toBe('C');
      });

      expect(checkDidSuspend()).toBe(true);
    });
  });

  // TODO: Fix this test to sync next-router-mock and window.location.search
  test.skip('should work with sub funnel when is multiple used', async () => {
    function SubFunnel(props: { onNext(id: string): void }) {
      const funnel = useFunnel<{
        sub1: { id?: string };
        sub2: { id: string };
      }>({
        id: 'sub',
        initial: {
          step: 'sub1',
          context: {},
        },
      });
      return (
        <funnel.Render
          sub1={({ history }) => <button onClick={() => history.push('sub2', { id: 'SubId' })}>Go to sub2</button>}
          sub2={({ context }) => {
            return (
              <div>
                <h1>Your id is {context.id}?</h1>
                <button onClick={() => props.onNext(context.id)}>OK</button>
              </div>
            );
          }}
        />
      );
    }

    function MainFunnel() {
      const funnel = useFunnel<{
        main1: { id1?: string };
        main2: { id1: string; id2?: string };
        main3: { id1: string; id2?: string };
      }>({
        id: 'main',
        initial: {
          step: 'main1',
          context: {},
        },
      });

      return (
        <funnel.Render
          main1={({ history }) => <SubFunnel onNext={(id) => history.push('main2', { id1: id })} />}
          main2={({ context, history }) => (
            <div>
              <h1>id1 is {context.id1}!</h1>
              {context.id2 == null ? (
                <button onClick={() => history.push('main3')}>set id2</button>
              ) : (
                <h1>id2 is {context.id2}</h1>
              )}
            </div>
          )}
          main3={({ history }) => <SubFunnel onNext={(id) => history.push('main2', { id2: id })} />}
        />
      );
    }

    render(<MainFunnel />);

    // Main1/Sub1
    expect(screen.queryByText('Go to sub2')).not.toBeNull();

    const user = userEvent.setup();
    await user.click(screen.getByText('Go to sub2'));

    // Main1/Sub2
    expect(screen.queryByText('Your id is SubId?')).not.toBeNull();
    await user.click(screen.getByText('OK'));

    // Main2
    expect(screen.queryByText('id1 is SubId!')).not.toBeNull();
    expect(screen.queryByText('set id2')).not.toBeNull();
    await user.click(screen.getByText('set id2'));

    // Main3/Sub1
    expect(screen.queryByText('Go to sub2')).not.toBeNull();

    await user.click(screen.getByText('Go to sub2'));

    // Main3/Sub2
    expect(screen.queryByText('Your id is SubId?')).not.toBeNull();
    await user.click(screen.getByText('OK'));

    // Main2
    expect(screen.queryByText('id1 is SubId!')).not.toBeNull();
    expect(screen.queryByText('id2 is SubId')).not.toBeNull();
  });
});
