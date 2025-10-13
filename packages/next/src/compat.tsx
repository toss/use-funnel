import { createFunnelSteps } from '@use-funnel/core';
import { useRouter } from 'next/router.js';
import { Children, isValidElement, PropsWithChildren, useCallback, useEffect, useMemo, useRef } from 'react';
import { useFunnel as useFunnelBase } from './useFunnel.js';

function Step(props: { children: React.ReactNode; name: string; onEnter?: () => void }) {
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

type IsNever<T> = [T] extends [never] ? true : false;
type Context = Record<string, unknown>;
type StepWithContext<Steps extends readonly [string, ...string[]], TContext extends Context> = {
  step?: Steps[number];
} & TContext;

export function useFunnel<TSteps extends readonly [string, ...string[]], TContext extends Context = never>(
  stepNames: TSteps,
  options?: {
    /**
     * 이 query key는 현재 스텝을 query string에 저장하기 위해 사용됩니다.
     * @default 'funnel-step'
     */
    stepQueryKey?: string | undefined;
    initialStep?: TSteps[number] | undefined;
    initialContext?: TContext;
    onStepChange?: ((name: TSteps[number]) => void) | undefined;
  },
): [
  React.ComponentType<{ children: React.ReactNode }> & {
    Step: React.ComponentType<{ children: React.ReactNode; name: TSteps[number]; onEnter?: () => void }>;
  },
  ...(IsNever<TContext> extends true
    ? [(step: TSteps[number], options?: SetStepOptions) => void]
    : [
        TContext,
        (
          context:
            | Partial<StepWithContext<TSteps, TContext>>
            | ((prev: StepWithContext<TSteps, TContext>) => Partial<StepWithContext<TSteps, TContext>>),
          options?: SetStepOptions,
        ) => void,
      ]),
] & {
  withState: <TContext extends Context>(
    initialState: TContext,
  ) => [
    React.ComponentType<{ children: React.ReactNode }> & {
      Step: React.ComponentType<{ children: React.ReactNode; name: TSteps[number]; onEnter?: () => void }>;
    },
    StepWithContext<TSteps, TContext>,
    (
      next:
        | Partial<StepWithContext<TSteps, TContext>>
        | ((prev: StepWithContext<TSteps, TContext>) => Partial<StepWithContext<TSteps, TContext>>),
      options?: SetStepOptions,
    ) => void,
  ];
} {
  const router = useRouter();
  const { stepQueryKey = 'funnel-step', initialStep = stepNames[0], initialContext, onStepChange } = options || {};
  const steps = createFunnelSteps<{}>()
    .extends(stepNames as unknown as string[])
    .build();
  const initialContextRef = useRef(initialContext ?? INITIAL_CONTEXT);
  initialContextRef.current = initialContext ?? INITIAL_CONTEXT;
  const queryStep = router.query[stepQueryKey] as TSteps[number] | undefined;
  const funnel = useFunnelBase({
    steps,
    id: stepQueryKey,
    initial: {
      step: queryStep != null && stepNames.includes(queryStep) ? queryStep : initialStep,
      context: initialContextRef.current,
    },
    stepQueryName: (id) => id,
    disableCleanup: true,
  });
  const onStepChangeRef = useRef(onStepChange);
  onStepChangeRef.current = onStepChange;

  const FunnelComponent = useMemo(() => {
    return Object.assign(
      function RouteFunnel(props: PropsWithChildren) {
        const { children } = props;
        const stepProps = Object.fromEntries(
          Children.toArray(children)
            .filter(isValidElement)
            .filter((i) => {
              const name = (i.props as { name: string } | undefined)?.name;
              return name != null && name in steps;
            })
            .map((i) => {
              const props = i.props as PropsWithChildren<{ name: string }>;
              return [props.name, () => i];
            }),
        );
        return <funnel.Render {...stepProps} />;
      },
      {
        Step: Step,
      },
    );
  }, [funnel.Render]);

  const setStep = useCallback(
    async (step: TSteps[number], options?: SetStepOptions) => {
      const { stepChangeType = 'push', preserveQuery = true, query = {}, context } = options || {};
      if (funnel.step !== step) {
        onStepChangeRef.current?.(step);
      }
      await funnel.history[stepChangeType === 'replace' ? 'replace' : 'push'](step as any, context, {
        query,
        preserveQuery,
      });
    },
    [funnel.history, funnel.step, stepQueryKey, router.query],
  );

  const state = funnel.context;
  const setState = useCallback(
    (
      next:
        | StepWithContext<TSteps, TContext>
        | ((prev: StepWithContext<TSteps, TContext>) => StepWithContext<TSteps, TContext>),
      options?: SetStepOptions,
    ) => {
      const state =
        typeof next === 'function'
          ? next({ ...funnel.context, step: funnel.step } as StepWithContext<TSteps, TContext>)
          : next;
      const { step = funnel.step, ...context } = state;
      return setStep(step, {
        ...options,
        context,
      });
    },
    [funnel],
  );

  const withState = <StateExcludeStep extends StepWithContext<TSteps, Context>>(initialState: StateExcludeStep) => {
    if (funnel.context === initialContextRef.current) {
      throw setState(
        {
          ...initialState,
          step: funnel.step,
        } as any,
        {
          stepChangeType: 'replace',
        },
      );
    }
    return [
      FunnelComponent,
      {
        ...state,
        step: funnel.step,
      },
      setState,
    ];
  };

  return Object.assign(
    options?.initialContext == null
      ? [FunnelComponent, setStep]
      : [
          FunnelComponent,
          {
            ...state,
            step: funnel.step,
          },
          setState,
        ],
    {
      withState,
    },
  ) as never;
}
