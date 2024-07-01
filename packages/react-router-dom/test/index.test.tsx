import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { useFunnel } from '../src/index.js';

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
          return <button onClick={() => funnel.history.push('B', { id: 'vitest' })}>Go B</button>;
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

    render(<FunnelTest />, { wrapper: BrowserRouter });

    expect(screen.queryByText('Go B')).not.toBeNull();

    const user = userEvent.setup();
    await user.click(screen.getByText('Go B'));

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
