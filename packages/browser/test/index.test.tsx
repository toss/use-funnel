import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { useFunnel } from '../src/index.js';

describe('Test useFunnel browser router', () => {
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
              <button onClick={() => window.history.back()}>Go Back</button>
              <div>{funnel.context.id}</div>
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

    await user.click(screen.getByText('Go Back'));

    expect(screen.queryByText('vitest')).toBeNull();
    expect(screen.queryByText('Go B')).not.toBeNull();
  });
});
