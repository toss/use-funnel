import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, test } from 'vitest';
import { createUseFunnel } from '../src/index.js';
import { MemoryRouter, MemoryRouterProvider } from './memoryRouter.js';

function exhaustiveCheck(value: never): never {
  throw new Error(`Unhandled value: ${value}`);
}

const useFunnel = createUseFunnel(MemoryRouter);

describe('Test useFunnel()', () => {
  afterEach(cleanup);

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
        });

        switch (funnel.step) {
          case 'A': {
            return <button onClick={() => funnel.history.push('B', { id: 'vitest' })}>Go B</button>;
          }
          case 'B': {
            return <div>{funnel.context.id}</div>;
          }
          default: {
            exhaustiveCheck(funnel);
          }
        }
      }

      render(<FunnelTest />, { wrapper: MemoryRouterProvider });

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
        });
        return (
          <funnel.Render
            A={({ history }) => <button onClick={() => history.push('B', { id: 'vitest' })}>Go B</button>}
            B={({ context }) => <div>{context.id}</div>}
          />
        );
      }

      render(<FunnelRenderTest />, { wrapper: MemoryRouterProvider });

      expect(screen.queryByText('Go B')).not.toBeNull();

      const user = userEvent.setup();
      await user.click(screen.getByText('Go B'));

      expect(screen.queryByText('vitest')).not.toBeNull();
    });

    test('should work funnel.Render.with', async () => {
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
        });
        return (
          <funnel.Render
            A={funnel.Render.with({
              events: {
                GoB: (payload: { id: string }, { history }) => {
                  history.push('B', { id: payload.id });
                },
              },
              render({ dispatch }) {
                return <button onClick={() => dispatch('GoB', { id: 'vitest' })}>Go B</button>;
              },
            })}
            B={({ context }) => <div>{context.id}</div>}
          />
        );
      }

      render(<FunnelWithEventsTest />, { wrapper: MemoryRouterProvider });

      expect(screen.queryByText('Go B')).not.toBeNull();

      const user = userEvent.setup();
      await user.click(screen.getByText('Go B'));

      expect(screen.queryByText('vitest')).not.toBeNull();
    });

    test('should work funnel.Render.overlay', async () => {
      function FunnelRenderTest() {
        const funnel = useFunnel<{
          _: { id?: string };
          A: { id?: string };
          B: { id: string };
        }>({
          id: 'vitest',
          initial: {
            step: '_',
            context: {},
          },
        });
        return (
          <funnel.Render
            _={({ history }) => <button onClick={() => history.push('A')}>Go A</button>}
            A={funnel.Render.with({
              events: {
                GoB: ({ id }: { id: string }, { history }) => {
                  history.push('B', (prev) => ({ ...prev, id }));
                },
              },
              render({ dispatch }) {
                return <button onClick={() => dispatch('GoB', { id: 'vitest' })}>Go B</button>;
              },
            })}
            B={funnel.Render.overlay({
              render({ context, close }) {
                return (
                  <div>
                    <p>overlay: {context.id}</p>
                    <button onClick={close}>Close Overlay</button>
                  </div>
                );
              },
            })}
          />
        );
      }

      render(<FunnelRenderTest />, { wrapper: MemoryRouterProvider });

      expect(screen.queryByText('Go A')).not.toBeNull();

      const user = userEvent.setup();
      await user.click(screen.getByText('Go A'));

      expect(screen.queryByText('Go B')).not.toBeNull();
      expect(screen.queryByText('Go A')).toBeNull();

      await user.click(screen.getByText('Go B'));

      expect(screen.queryByText('Go A')).toBeNull();
      expect(screen.queryByText('Go B')).not.toBeNull();
      expect(screen.queryByText('overlay: vitest')).not.toBeNull();

      // close overlay
      await user.click(screen.getByText('Close Overlay'));

      expect(screen.queryByText('Go A')).toBeNull();
      expect(screen.queryByText('Go B')).not.toBeNull();
      expect(screen.queryByText('overlay: vitest')).toBeNull();
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

      render(<MainFunnel />, { wrapper: MemoryRouterProvider });

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
});
