import { useFunnel as useFunnelBase, createFunnelSteps } from "./index.js";
import { useRouter } from "next/router.js";

import '@toss/use-funnel'

import { useCallback, useMemo, Children, isValidElement, useEffect, PropsWithChildren, useRef } from "react";

function Step(props: {
  children: React.ReactNode;
  name: string;
  onEnter?: () => void;
}) {
  const { children, onEnter } = props;
  useEffect(() => {
    onEnter?.();
  }, [onEnter]);
  return <>{children}</>;
}

interface SetStepOptions {
  stepChangeType?: 'push' | 'replace';
  preserveQuery?: boolean;
  query?: Record<string, any>;
  context?: Record<string, unknown>;
}

const INITIAL_CONTEXT = {};

export function useFunnel<Steps extends readonly [string, ...string[]]>(
  stepNames: Steps,
  options?: {
    /**
     * 이 query key는 현재 스텝을 query string에 저장하기 위해 사용됩니다.
     * @default 'funnel-step'
     */
    stepQueryKey?: string | undefined;
    initialStep?: Steps[number] | undefined;
    onStepChange?: ((name: Steps[number]) => void) | undefined;
  },
): [
  React.ComponentType<{ children: React.ReactNode }> & {
    Step: React.ComponentType<{ children: React.ReactNode; name: Steps[number]; onEnter?: () => void }>;
  },
  (step: Steps[number], options?: SetStepOptions) => Promise<void>,
] & {
  withState: <StateExcludeStep extends Record<string, unknown> & {
    step?: Steps[number];
  }>(initialState: StateExcludeStep) => [
    React.ComponentType<{ children: React.ReactNode }> & {
      Step: React.ComponentType<{ children: React.ReactNode; name: Steps[number]; onEnter?: () => void }>;
    },
    StateExcludeStep & {
      step: Steps[number];
    },
    (next: {step?: Steps[number]} & Partial<StateExcludeStep> | ((prev: ({ step?: Steps[number] } & Partial<StateExcludeStep>)) => {step?: Steps[number]} & Partial<StateExcludeStep>), options?: SetStepOptions) => Promise<void>,
  ]
} {
  const router = useRouter();
  const stepQueryKey = options?.stepQueryKey ?? 'funnel-step';
  const initialStep = router.query[stepQueryKey] as Steps[number] ?? stepNames[0];
  const steps = createFunnelSteps<{}>().extends(stepNames as unknown as string[]).build();
  const funnel = useFunnelBase({
    steps,
    id: stepQueryKey,
    initial: {
      step: initialStep,
      context: INITIAL_CONTEXT,
    }
  });
  const onStepChangeRef = useRef(options?.onStepChange);
  onStepChangeRef.current = options?.onStepChange;

  const FunnelComponent = useMemo(() => {
    return Object.assign(function RouteFunnel(props: PropsWithChildren) {
      const { children } = props;
      const stepProps = Object.fromEntries(Children.toArray(children).filter(isValidElement).filter((i) => {
        const name = (i.props as { name: string } | undefined)?.name;
        return name != null && name in steps;
      }).map((i) => {
        const props = i.props as PropsWithChildren<{ name: string }>;
        return [props.name, () => i];
      }));
      return <funnel.Render {...stepProps} />;
    }, {
      Step: Step,
    });
  }, [funnel.Render]);

  const setStep = useCallback(async (step: Steps[number], options?: SetStepOptions) => {
    const { stepChangeType = 'push', preserveQuery = true, query = {}, context } = options || {};
    await router.replace(
      {
        pathname: router.pathname,
        query: {
          ...(preserveQuery ? router.query : {}),
          ...query,
          [stepQueryKey]: step,
        }
      },
      undefined,
      { shallow: true }
    );
    if (funnel.step !== step) {
      onStepChangeRef.current?.(step);
    }
    funnel.history[stepChangeType === 'replace' ? 'replace' : 'push'](step as any, context);
  }, [funnel.history, funnel.step, stepQueryKey, router.query]);

  const state = funnel.context;
  const setState = useCallback((next: {step?: Steps[number]} & Record<string, unknown> | ((prev: ({ step?: Steps[number] } & Record<string, unknown>)) => {step?: Steps[number]} & Record<string, unknown>), options?: SetStepOptions) => {
    const state = typeof next === 'function' ? next({ ...funnel.context, step: funnel.step }) : next;
    const { step = funnel.step, ...context } = state;
    return setStep(step, {
      ...options,
      context,
    });
  }, [funnel]);

  const withState = <StateExcludeStep extends Record<string, unknown> & {
    step?: undefined;
  }>(initialState: StateExcludeStep) => {
    if (funnel.context === INITIAL_CONTEXT) {
      throw setState({
        ...initialState,
        step: funnel.step,
      }, {
        stepChangeType: 'replace'
      });
    }
    return [FunnelComponent, {
      ...state,
      step: funnel.step,
    }, setState];
  }

  return Object.assign([FunnelComponent, setStep], {
    withState,
  }) as never;
}