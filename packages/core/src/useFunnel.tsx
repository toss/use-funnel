import { useCallback, useEffect, useMemo } from 'react';
import {
  AnyStepContextMap,
  FunnelHistory,
  FunnelStateByContextMap,
  FunnelStep,
  FunnelStepByContextMap,
  RouteOption,
} from './core.js';
import { FunnelRender, FunnelRenderComponentProps } from './FunnelRender.js';
import { overlayRenderWith, renderWith } from './renderHelpers.js';
import { FunnelRouter } from './router.js';
import { FunnelStepOption, funnelStepOptionIsGuard, funnelStepOptionIsParse } from './stepBuilder.js';
import { useStateStore, useStateSubscriberStore, useUpdatableRef } from './utils.js';

export interface UseFunnelOptions<TStepContextMap extends AnyStepContextMap> {
  id: string;
  initial: FunnelStateByContextMap<TStepContextMap>;
  steps?: {
    [TStepName in keyof TStepContextMap]: FunnelStepOption<TStepContextMap[TStepName]>;
  };
}

export type UseFunnelResults<TStepContextMap extends AnyStepContextMap, TRouteOption extends RouteOption> = {
  Render: ((props: FunnelRenderComponentProps<TStepContextMap, TRouteOption>['steps']) => JSX.Element) & {
    with: typeof renderWith;
    overlay: typeof overlayRenderWith;
  };
} & FunnelStepByContextMap<TStepContextMap, TRouteOption>;

export interface UseFunnel<TRouteOption extends RouteOption> {
  <
    _TStepContextMap extends AnyStepContextMap,
    TStepKeys extends keyof _TStepContextMap = keyof _TStepContextMap,
    TStepContext extends _TStepContextMap[TStepKeys] = _TStepContextMap[TStepKeys],
    TStepContextMap extends string extends keyof _TStepContextMap
    ? Record<TStepKeys, TStepContext>
    : _TStepContextMap = string extends keyof _TStepContextMap ? Record<TStepKeys, TStepContext> : _TStepContextMap,
  >(
    options: UseFunnelOptions<TStepContextMap>,
  ): UseFunnelResults<TStepContextMap, TRouteOption>;
}

export function createUseFunnel<TRouteOption extends RouteOption>(
  useFunnelRouter: FunnelRouter<TRouteOption>,
): UseFunnel<TRouteOption> {
  return function useFunnel<
    _TStepContextMap extends AnyStepContextMap,
    TStepKeys extends keyof _TStepContextMap = keyof _TStepContextMap,
    TStepContext extends _TStepContextMap[TStepKeys] = _TStepContextMap[TStepKeys],
    TStepContextMap extends string extends keyof _TStepContextMap
    ? Record<TStepKeys, TStepContext>
    : _TStepContextMap = string extends keyof _TStepContextMap ? Record<TStepKeys, TStepContext> : _TStepContextMap,
  >(options: UseFunnelOptions<TStepContextMap>): UseFunnelResults<TStepContextMap, TRouteOption> {
    const optionsRef = useUpdatableRef(options);
    const router = useFunnelRouter({
      id: optionsRef.current.id,
      initialState: optionsRef.current.initial,
    });
    const currentState = (router.history[router.currentIndex] ??
      options.initial) as FunnelStateByContextMap<TStepContextMap>;
    const currentStateRef = useUpdatableRef(currentState);

    const cleanUpRef = useUpdatableRef(router.cleanup);

    useEffect(() => {
      return () => {
        cleanUpRef.current();
      }
    }, [])

    const parseStepContext = useCallback(
      <TStep extends keyof TStepContextMap>(step: TStep, context: unknown): TStepContextMap[TStep] | null => {
        const stepOption = optionsRef.current.steps?.[step];
        if (stepOption == null) {
          return context as TStepContextMap[TStep];
        }
        // 1. check parse function
        if (funnelStepOptionIsParse(stepOption)) {
          return stepOption.parse(context);
        }
        // 2. check guard function
        if (funnelStepOptionIsGuard(stepOption)) {
          return stepOption.guard(context) ? context : null;
        }
        return null;
      },
      [optionsRef],
    );

    const history: FunnelHistory<TStepContextMap, keyof TStepContextMap & string, TRouteOption> = useMemo(() => {
      const transition = (step: keyof TStepContextMap, assignContext?: object | ((prev: object) => object)) => {
        const newContext =
          typeof assignContext === 'function'
            ? assignContext(currentStateRef.current.context)
            : {
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
    }, [router.replace, router.push, router.go, optionsRef, parseStepContext]);

    const step: FunnelStep<TStepContextMap, keyof TStepContextMap & string, TRouteOption> = useMemo(() => {
      const validContext = parseStepContext(currentState.step, currentState.context);
      return {
        ...(validContext == null
          ? optionsRef.current.initial
          : {
            step: currentState.step,
            context: validContext,
          }),
        history,
        index: router.currentIndex,
        historySteps: router.history as FunnelStateByContextMap<TStepContextMap>[],
      };
    }, [currentState, history, router.history, router.currentIndex, parseStepContext]);

    const currentStepStoreRef = useStateSubscriberStore(step);

    const Render = useMemo(() => {
      return Object.assign(
        (props: FunnelRenderComponentProps<TStepContextMap, TRouteOption>['steps']) => {
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
