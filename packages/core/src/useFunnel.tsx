import { useMemo } from 'react';
import { AnyStepContextMap, FunnelHistory, FunnelStateByContextMap, FunnelStepByContextMap } from './core.js';
import { FunnelRender, FunnelRenderComponentProps } from './FunnelRender.js';
import { with$ } from './renderHelpers.js';
import { FunnelRouter } from './router.js';
import { useStateStore, useStateSubscriberStore, useUpdatableRef } from './utils.js';

export interface UseFunnelOptions<TStepContextMap extends AnyStepContextMap> {
  id: string;
  initial: FunnelStateByContextMap<TStepContextMap>;
  contextGuard?: {
    [TStepName in keyof TStepContextMap]: (data: unknown) => TStepContextMap[TStepName];
  };
  steps?: (keyof TStepContextMap)[];
}

export type UseFunnelResults<TStepContextMap extends AnyStepContextMap> = {
  Render: ((props: FunnelRenderComponentProps<TStepContextMap>['steps']) => JSX.Element) & {
    with: typeof with$;
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
    const currentStateRef = useUpdatableRef(router.currentState);

    const history: FunnelHistory<TStepContextMap, keyof TStepContextMap & string> = useMemo(() => {
      const transition = (step: keyof TStepContextMap, assignContext?: object) => {
        const newContext = {
          ...currentStateRef.current.context,
          ...assignContext,
        };
        return {
          step,
          context: optionsRef.current.contextGuard?.[step]
            ? optionsRef.current.contextGuard[step](newContext)
            : newContext,
        } as FunnelStateByContextMap<TStepContextMap>;
      };
      return {
        push: async (...args) => {
          const [step, assignContext] = args;
          const nextState = transition(step, assignContext);
          await router.push(nextState);
          return nextState as never;
        },
        replace: async (...args) => {
          const [step, assignContext] = args;
          const nextState = transition(step, assignContext);
          await router.replace(nextState);
          return nextState as never;
        },
      };
    }, [router.replace, router.push, optionsRef]);

    const step = useMemo(
      () => ({
        ...router.currentState,
        history,
        beforeSteps: router.history.slice(0, router.currentIndex),
      }),
      [router.currentState, history, router.history, router.currentIndex],
    );

    const currentStepStoreRef = useStateSubscriberStore(step);

    const Render = useMemo(() => {
      return Object.assign(
        (props: FunnelRenderComponentProps<TStepContextMap>['steps']) => {
          const currentStep = useStateStore(currentStepStoreRef);
          return <FunnelRender funnel={currentStep} steps={props} />;
        },
        {
          with: with$,
        },
      );
    }, [currentStepStoreRef]);

    return {
      ...step,
      Render,
    };
  };
}
