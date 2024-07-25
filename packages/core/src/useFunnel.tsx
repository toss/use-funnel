import { useCallback, useMemo } from 'react';
import { AnyStepContextMap, FunnelHistory, FunnelStateByContextMap, FunnelStepByContextMap } from './core.js';
import { FunnelRender, FunnelRenderComponentProps } from './FunnelRender.js';
import { overlayRenderWith, renderWith } from './renderHelpers.js';
import { FunnelRouter } from './router.js';
import { FunnelStepOption } from './stepBuilder.js';
import { useStateStore, useStateSubscriberStore, useUpdatableRef } from './utils.js';

export interface UseFunnelOptions<TStepContextMap extends AnyStepContextMap> {
  id: string;
  initial: FunnelStateByContextMap<TStepContextMap>;
  steps?: {
    [TStepName in keyof TStepContextMap]: FunnelStepOption<TStepContextMap[TStepName], any>;
  };
}

export type UseFunnelResults<TStepContextMap extends AnyStepContextMap> = {
  Render: ((props: FunnelRenderComponentProps<TStepContextMap>['steps']) => JSX.Element) & {
    with: typeof renderWith;
    overlay: typeof overlayRenderWith;
  };
} & FunnelStepByContextMap<TStepContextMap>;

export interface UseFunnel {
  <
    _TStepContextMap extends AnyStepContextMap,
    TStepKeys extends keyof _TStepContextMap = keyof _TStepContextMap,
    TStepContext extends _TStepContextMap[TStepKeys] = _TStepContextMap[TStepKeys],
    TStepContextMap extends string extends keyof _TStepContextMap
      ? Record<TStepKeys, TStepContext>
      : _TStepContextMap = string extends keyof _TStepContextMap ? Record<TStepKeys, TStepContext> : _TStepContextMap,
  >(
    options: UseFunnelOptions<TStepContextMap>,
  ): UseFunnelResults<TStepContextMap>;
}

export function createUseFunnel(useFunnelRouter: FunnelRouter): UseFunnel {
  return function useFunnel<
    _TStepContextMap extends AnyStepContextMap,
    TStepKeys extends keyof _TStepContextMap = keyof _TStepContextMap,
    TStepContext extends _TStepContextMap[TStepKeys] = _TStepContextMap[TStepKeys],
    TStepContextMap extends string extends keyof _TStepContextMap
      ? Record<TStepKeys, TStepContext>
      : _TStepContextMap = string extends keyof _TStepContextMap ? Record<TStepKeys, TStepContext> : _TStepContextMap,
  >(options: UseFunnelOptions<TStepContextMap>): UseFunnelResults<TStepContextMap> {
    const optionsRef = useUpdatableRef(options);
    const router = useFunnelRouter({
      id: options.id,
      initialState: options.initial,
    });
    const currentState = router.history[router.currentIndex];
    const currentStateRef = useUpdatableRef(currentState);

    const parseStepContext = useCallback(
      <TStep extends keyof TStepContextMap>(step: TStep, context: unknown): TStepContextMap[TStep] | null => {
        const stepOption = optionsRef.current.steps?.[step];
        if (stepOption == null) {
          return context as TStepContextMap[TStep];
        }
        // 1. check parse function
        if (stepOption.parse != null) {
          return stepOption.parse(context);
        }
        // 2. check guard function
        if (stepOption.guard != null) {
          return stepOption.guard(context) ? context : null;
        }
        return null;
      },
      [optionsRef],
    );

    const history: FunnelHistory<TStepContextMap, keyof TStepContextMap & string> = useMemo(() => {
      const transition = (step: keyof TStepContextMap, assignContext?: object) => {
        const newContext = {
          ...currentStateRef.current.context,
          ...assignContext,
        };
        const context = parseStepContext(step, newContext);
        return context == null
          ? optionsRef.current.initial
          : ({
              step,
              context,
            } as FunnelStateByContextMap<TStepContextMap>);
      };
      return {
        push: async (...args) => {
          const [step, assignContext, transitionOption] = args;
          const nextState = transition(step, assignContext);
          await router.push(nextState, transitionOption);
          return nextState as never;
        },
        replace: async (...args) => {
          const [step, assignContext, transitionOption] = args;
          const nextState = transition(step, assignContext);
          await router.replace(nextState, transitionOption);
          return nextState as never;
        },
        go: router.go,
        back: () => router.go(-1),
      };
    }, [router.replace, router.push, router.go, optionsRef]);

    const step = useMemo(() => {
      const validContext = parseStepContext(currentState.step, currentState.context);
      return {
        ...(validContext == null
          ? optionsRef.current.initial
          : {
              step: currentState.step,
              context: validContext,
            }),
        history,
        beforeSteps: router.history.slice(0, router.currentIndex),
      };
    }, [currentState, history, router.history, router.currentIndex]);

    const currentStepStoreRef = useStateSubscriberStore(step);

    const Render = useMemo(() => {
      return Object.assign(
        (props: FunnelRenderComponentProps<TStepContextMap>['steps']) => {
          const currentStep = useStateStore(currentStepStoreRef);
          return <FunnelRender funnel={currentStep} steps={props} />;
        },
        {
          with: renderWith,
          overlay: overlayRenderWith,
        },
      );
    }, [currentStepStoreRef]);

    return {
      ...step,
      Render,
    };
  };
}
