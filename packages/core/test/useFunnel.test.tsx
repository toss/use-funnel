import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, test } from 'vitest';
import { createUseFunnel } from '../src/index.js';
import { MemoryRouter } from './memoryRouter.js';

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
        });
        return (
          <funnel.Render
            A={({ history }) => <button onClick={() => history.push('B', { id: 'vitest' })}>Go B</button>}
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
                return <button onClick={() => dispatch({ type: 'GoB', payload: { id: 'vitest' } })}>Go B</button>;
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

    test('should work funnel.Render.overlay', async () => {
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
            A={funnel.Render.with({
              events: {
                GoB: (payload: { id: string }, { history }) => {
                  history.push('B', { id: payload.id });
                },
              },
              render({ dispatch }) {
                return <button onClick={() => dispatch({ type: 'GoB', payload: { id: 'vitest' } })}>Go B</button>;
              },
            })}
            B={funnel.Render.with({
              overlay: true,
              render({ context }) {
                return <div>{context.id}</div>;
              },
            })}
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
