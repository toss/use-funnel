import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { useRouter } from 'next/router.js';
import { useFunnel } from '../src/index.js';

const B = ({ context }: { context: { id: string } }) => {
  const router = useRouter();

  return (
    <div>
      <button onClick={() => router.back()}>Go Back</button>
      <div>{context.id}</div>
    </div>
  );
};

describe('Test useFunnel next router', () => {
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
          return <B context={funnel.context} />;
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
  });
});
