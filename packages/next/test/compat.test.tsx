import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { Suspense } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFunnel } from '../src/compat.js';

describe('useFunnel', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/');
  });

  it('should be work', async () => {
    const onStepChange = vi.fn();
    function Test() {
      const [Funnel, setStep] = useFunnel(['a', 'b', 'c'] as const, {
        onStepChange: onStepChange,
      });
      return (
        <Funnel>
          <Funnel.Step name="a">
            <button onClick={() => setStep('b')}>b</button>
          </Funnel.Step>
          <Funnel.Step name="b">
            <button onClick={() => setStep('c')}>c</button>
          </Funnel.Step>
          <Funnel.Step name="c">
            <button onClick={() => setStep('a')}>a</button>
          </Funnel.Step>
        </Funnel>
      );
    }
    render(<Test />);
    expect(screen.getByRole('button', { name: 'b' })).not.toBeNull();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'b' }));
    expect(onStepChange).toHaveBeenLastCalledWith('b');
    expect(screen.getByRole('button', { name: 'c' })).not.toBeNull();
    expect(mockRouter.query['funnel-step']).toBe('b');
    await user.click(screen.getByRole('button', { name: 'c' }));
    expect(onStepChange).toHaveBeenLastCalledWith('c');
    expect(screen.getByRole('button', { name: 'a' })).not.toBeNull();
    expect(mockRouter.query['funnel-step']).toBe('c');
    await user.click(screen.getByRole('button', { name: 'a' }));
    expect(onStepChange).toHaveBeenLastCalledWith('a');
    expect(screen.getByRole('button', { name: 'b' })).not.toBeNull();
    expect(mockRouter.query['funnel-step']).toBe('a');
  });

  it('should be work when initialStep is defined', async () => {
    function Test() {
      const [Funnel, setStep] = useFunnel(['a', 'b', 'c'] as const, {
        initialStep: 'b',
      });
      return (
        <Funnel>
          <Funnel.Step name="a">
            <button onClick={() => setStep('b')}>b</button>
          </Funnel.Step>
          <Funnel.Step name="b">
            <button onClick={() => setStep('c')}>c</button>
          </Funnel.Step>
          <Funnel.Step name="c">
            <button onClick={() => setStep('a')}>a</button>
          </Funnel.Step>
        </Funnel>
      );
    }
    render(<Test />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'c' })).not.toBeNull());
  });

  it('should be work with withState', async () => {
    function Test() {
      const [Funnel, state, setState] = useFunnel(['a', 'b', 'c'] as const).withState({
        foo: 'bar',
        a: false,
        b: false,
        c: false,
      });
      return (
        <div>
          <h1>{state.foo}</h1>
          <Funnel>
            <Funnel.Step name="a">
              <button
                onClick={() =>
                  setState({
                    a: true,
                    step: 'b',
                    foo: 'from a',
                  })
                }
              >
                b
              </button>
            </Funnel.Step>
            <Funnel.Step name="b">
              <button
                onClick={() =>
                  setState({
                    b: true,
                    step: 'c',
                    foo: 'from b',
                  })
                }
              >
                c
              </button>
            </Funnel.Step>
            <Funnel.Step name="c">
              <button
                onClick={() =>
                  setState({
                    c: true,
                    step: 'a',
                    foo: 'from c',
                  })
                }
              >
                a
              </button>
            </Funnel.Step>
          </Funnel>
        </div>
      );
    }
    render(
      <Suspense fallback={<div>loading...</div>}>
        <Test />
      </Suspense>,
    );
    expect(screen.getByText('loading...')).not.toBeNull();
    await waitFor(() => expect(screen.getByText('bar')).not.toBeNull());
    expect(screen.getByRole('button', { name: 'b' })).not.toBeNull();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'b' }));
    expect(screen.getByText('from a')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'c' })).not.toBeNull();
    expect(mockRouter.query['funnel-step']).toBe('b');
    await user.click(screen.getByRole('button', { name: 'c' }));
    expect(screen.getByText('from b')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'a' })).not.toBeNull();
    expect(mockRouter.query['funnel-step']).toBe('c');
    await user.click(screen.getByRole('button', { name: 'a' }));
    expect(screen.getByText('from c')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'b' })).not.toBeNull();
    expect(mockRouter.query['funnel-step']).toBe('a');
  });

  it('should be work with intialContext', async () => {
    function Test() {
      const [Funnel, state, setState] = useFunnel(['a', 'b', 'c'] as const, {
        initialContext: {
          foo: 'bar',
          a: false,
          b: false,
          c: false,
        },
      });
      return (
        <div>
          <h1>{state.foo}</h1>
          <Funnel>
            <Funnel.Step name="a">
              <button
                onClick={() =>
                  setState({
                    a: true,
                    step: 'b',
                    foo: 'from a',
                  })
                }
              >
                b
              </button>
            </Funnel.Step>
            <Funnel.Step name="b">
              <button
                onClick={() =>
                  setState({
                    b: true,
                    step: 'c',
                    foo: 'from b',
                  })
                }
              >
                c
              </button>
            </Funnel.Step>
            <Funnel.Step name="c">
              <button
                onClick={() =>
                  setState({
                    c: true,
                    step: 'a',
                    foo: 'from c',
                  })
                }
              >
                a
              </button>
            </Funnel.Step>
          </Funnel>
        </div>
      );
    }
    render(<Test />);
    expect(screen.getByRole('button', { name: 'b' })).not.toBeNull();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'b' }));
    expect(await screen.findByText('from a')).not.toBeNull();
    expect(await screen.findByRole('button', { name: 'c' })).not.toBeNull();
    expect(mockRouter.query['funnel-step']).toBe('b');
    await user.click(screen.getByRole('button', { name: 'c' }));
    expect(await screen.findByText('from b')).not.toBeNull();
    expect(await screen.findByRole('button', { name: 'a' })).not.toBeNull();
    expect(mockRouter.query['funnel-step']).toBe('c');
    await user.click(screen.getByRole('button', { name: 'a' }));
    expect(await screen.findByText('from c')).not.toBeNull();
    expect(await screen.findByRole('button', { name: 'b' })).not.toBeNull();
    expect(mockRouter.query['funnel-step']).toBe('a');
  });
});
