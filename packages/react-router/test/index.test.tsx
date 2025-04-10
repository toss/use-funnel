import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter, Link, MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useFunnel } from '../src/index.js';

const mockSetUseSearchParams = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const imports = await importOriginal<typeof import('react-router')>();
  return {
    ...imports,
    useSearchParams: (...args) => {
      const [state, setState] = imports.useSearchParams(...args);
      return [
        state,
        (...args) => {
          mockSetUseSearchParams(...args);
          return setState(...args);
        },
      ] as const;
    },
  } as typeof imports;
});

afterEach(cleanup);

describe('Test useFunnel ReactRouter router', () => {
  test('should work', async () => {
    function FunnelTest() {
      const funnel = useFunnel<{
        A: { id?: string };
        B: { id: string };
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
              onClick={() =>
                funnel.history.push(
                  'B',
                  { id: 'vitest' },
                  {
                    viewTransition: true,
                    flushSync: true,
                  },
                )
              }
            >
              Go B Step
            </button>
          );
        }
        case 'B': {
          return (
            <div>
              <button onClick={() => funnel.history.back()}>Go Back</button>
              <div>{funnel.context.id}</div>
            </div>
          );
        }
        default: {
          throw new Error('Invalid step');
        }
      }
    }

    render(<FunnelTest />, { wrapper: (props) => <BrowserRouter {...props} window={window} /> });

    expect(screen.queryByText('Go B Step')).not.toBeNull();

    const user = userEvent.setup();
    await user.click(screen.getByText('Go B Step'));

    expect(mockSetUseSearchParams).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        flushSync: true,
        viewTransition: true,
      }),
    );

    expect(screen.queryByText('vitest')).not.toBeNull();

    // check history states
    expect(new URLSearchParams(location.search).get('vitest.step')).toBe('B');
    expect(history.state['usr']).toHaveProperty('vitest.context', {
      id: 'vitest',
    });

    await user.click(screen.getByText('Go Back'));

    expect(await screen.findByText('Go B Step')).not.toBeNull();
    expect(screen.queryByText('vitest')).toBeNull();
  });

  test('should work with sub funnel when is multiple used', async () => {
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

    render(<MainFunnel />, { wrapper: (props) => <BrowserRouter {...props} window={window} /> });

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

  test('should work when navigate out of funnel', async () => {
    function FunnelTest() {
      const funnel = useFunnel<{ A: { id?: string }; B: { id: string } }>({
        id: 'vitest',
        initial: {
          step: 'A',
          context: {},
        },
      });
      return (
        <div>
          <Link to="/">Go to home</Link>
          <h1>This is Funnel</h1>
          <funnel.Render
            A={({ history }) => <button onClick={() => history.push('B', { id: 'vitest' })}>Go B</button>}
            B={({ context }) => <div>This is B {context.id}</div>}
          />
        </div>
      );
    }

    render(
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h1>Home</h1>
              <Link to="/funnel">Go to funnel</Link>
            </>
          }
        />
        <Route path="/funnel" element={<FunnelTest />} />
      </Routes>,
      { wrapper: (props) => <BrowserRouter {...props} /> },
    );

    expect(screen.queryByText('Home')).not.toBeNull();

    const user = userEvent.setup();
    await user.click(screen.getByText('Go to funnel'));

    expect(screen.queryByText('This is Funnel')).not.toBeNull();

    await user.click(screen.getByText('Go B'));

    expect(screen.queryByText('This is B vitest')).not.toBeNull();

    await user.click(screen.getByText('Go to home'));

    expect(screen.queryByText('Home')).not.toBeNull();
    expect(screen.queryByText('This is Funnel')).toBeNull();
  });
});
