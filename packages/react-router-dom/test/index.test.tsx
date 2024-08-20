import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import { useFunnel } from '../src/index.js';

const mockSetUseSearchParams = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const imports = await importOriginal<typeof import('react-router-dom')>();
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

describe('Test useFunnel ReactRouter6 router', () => {
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
                    unstable_viewTransition: true,
                    unstable_flushSync: true,
                  },
                )
              }
            >
              Go B
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

    expect(screen.queryByText('Go B')).not.toBeNull();

    const user = userEvent.setup();
    await user.click(screen.getByText('Go B'));

    expect(mockSetUseSearchParams).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        unstable_flushSync: true,
        unstable_viewTransition: true,
      }),
    );

    expect(screen.queryByText('vitest')).not.toBeNull();

    // check history states
    expect(new URLSearchParams(location.search).get('vitest.step')).toBe('B');
    expect(history.state['usr']).toHaveProperty('vitest.context', {
      id: 'vitest',
    });

    await user.click(screen.getByText('Go Back'));

    expect(screen.queryByText('vitest')).toBeNull();
    expect(screen.queryByText('Go B')).not.toBeNull();
  });
});
