import { afterEach, describe, expect, test } from 'vitest';
import {
  render,
  screen,
  cleanup,
  renderHook,
  act,
} from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { FunnelAdapterProvider, useFunnel, withEvents } from '../src/index.js';
import { StateAdapter } from '../src/adapters/state.js';
import { Adapter } from '../src/adapters/type.js';

function exhaustiveCheck(value: never): never {
  throw new Error(`Unhandled value: ${value}`);
}

describe('Test useFunnel()', () => {
  afterEach(cleanup);

  describe('Test useFunnel hook options', () => {
    function setup({
      adapter,
      wrapper,
    }: {
      adapter?: Adapter;
      wrapper?: React.ComponentType<React.PropsWithChildren>;
    } = {}) {
      return renderHook(
        () =>
          useFunnel<{
            A: { id?: string };
            B: { id: string };
          }>({
            id: 'vitest',
            initial: {
              step: 'A',
              context: {},
            },
            adapter,
          }),
        {
          wrapper,
        }
      );
    }

    describe('Test useFunnel adapter option', () => {
      describe('When adapter options is successfully passed', () => {
        let hook: ReturnType<typeof setup>;

        afterEach(() => {
          expect(hook.result.current.step).toBe('A');
          expect(hook.result.current.context).toEqual({});
          act(() => {
            if (hook.result.current.step === 'A') {
              hook.result.current.history.push('B', { id: '1' });
            }
          });
          expect(hook.result.current.step).toBe('B');
          expect(hook.result.current.context).toEqual({ id: '1' });
        });

        describe('When adapter is passed by useFunnel options', () => {
          test('Should work', () => {
            hook = setup({ adapter: StateAdapter });
          });
        });

        describe('When adapter is passed by FunnelAdapterProvider', () => {
          test('Should work', () => {
            hook = setup({
              wrapper: ({ children }) => (
                <FunnelAdapterProvider adapter={StateAdapter}>
                  {children}
                </FunnelAdapterProvider>
              ),
            });
          });
        });
      });

      describe('When adapter options is not passed', () => {
        test('should throw an error', () => {
          expect(() => setup({ adapter: undefined })).toThrowError();
        });
      });
    });
  });

  describe('Test useFunnel hook results', () => {
    test('should work useFunnel with component render', async () => {
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
          adapter: StateAdapter,
        });

        switch (funnel.step) {
          case 'A': {
            return (
              <button
                onClick={() => funnel.history.push('B', { id: 'vitest' })}
              >
                Go B
              </button>
            );
          }
          case 'B': {
            return <div>{funnel.context.id}</div>;
          }
          default: {
            exhaustiveCheck(funnel);
          }
        }
      }

      render(<FunnelTest />);

      expect(screen.queryByText('Go B')).not.toBeNull();

      const user = userEvent.setup();
      await user.click(screen.getByText('Go B'));

      expect(screen.queryByText('vitest')).not.toBeNull();
    });

    test('should work funnel.Render', async () => {
      function FunnelRenderTest() {
        const funnel = useFunnel<{
          A: { id?: string };
          B: { id: string };
        }>({
          id: 'vitest',
          initial: {
            step: 'A',
            context: {},
          },
          adapter: StateAdapter,
        });
        return (
          <funnel.Render
            A={({ history }) => (
              <button onClick={() => history.push('B', { id: 'vitest' })}>
                Go B
              </button>
            )}
            B={({ context }) => <div>{context.id}</div>}
          />
        );
      }

      render(<FunnelRenderTest />);

      expect(screen.queryByText('Go B')).not.toBeNull();

      const user = userEvent.setup();
      await user.click(screen.getByText('Go B'));

      expect(screen.queryByText('vitest')).not.toBeNull();
    });

    test('should work funnel.withEvents', async () => {
      function FunnelWithEventsTest() {
        const funnel = useFunnel<{
          A: { id?: string };
          B: { id: string };
        }>({
          id: 'vitest',
          initial: {
            step: 'A',
            context: {},
          },
          adapter: StateAdapter,
        });
        return (
          <funnel.Render
            A={withEvents({
              events: {
                GoB: (payload: { id: string }, { history }) => {
                  history.push('B', { id: payload.id });
                },
              },
              render({ dispatch }) {
                return (
                  <button
                    onClick={() =>
                      dispatch({ type: 'GoB', payload: { id: 'vitest' } })
                    }
                  >
                    Go B
                  </button>
                );
              },
            })}
            B={({ context }) => <div>{context.id}</div>}
          />
        );
      }

      render(<FunnelWithEventsTest />);

      expect(screen.queryByText('Go B')).not.toBeNull();

      const user = userEvent.setup();
      await user.click(screen.getByText('Go B'));

      expect(screen.queryByText('vitest')).not.toBeNull();
    });

    test('should work FunnelRender overlay', async () => {
      function FunnelRenderTest() {
        const funnel = useFunnel<{
          A: { id?: string };
          B: { id: string };
        }>({
          id: 'vitest',
          initial: {
            step: 'A',
            context: {},
          },
          adapter: StateAdapter,
        });
        return (
          <funnel.Render
            A={({ history }) => (
              <button onClick={() => history.push('B', { id: 'vitest' })}>
                Go B
              </button>
            )}
            B={{
              type: 'overlay',
              render: ({ context }) => <div>{context.id}</div>,
            }}
          />
        );
      }

      render(<FunnelRenderTest />);

      expect(screen.queryByText('Go B')).not.toBeNull();

      const user = userEvent.setup();
      await user.click(screen.getByText('Go B'));

      expect(screen.queryByText('Go B')).not.toBeNull();
      expect(screen.queryByText('vitest')).not.toBeNull();
    });
  });
});
