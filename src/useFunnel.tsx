import { useMemo } from "react";
import {
  AnyStepContextMap,
  FunnelHistory,
  FunnelStepByContextMap,
  FunnelStateByContextMap,
} from "./core.js";
import { FunnelRender, FunnelRenderComponentProps } from "./FunnelRender.js";
import {
  useFunnelAdapter,
  UseFunnelAdapterOptions,
} from "./useFunnelAdapter.js";
import {
  useStateStore,
  useStateSubscriberStore,
  useUpdatableRef,
} from "./utils.js";

export interface UseFunnelOptions<TStepContextMap extends AnyStepContextMap>
  extends UseFunnelAdapterOptions<TStepContextMap> {
  contextGuard?: {
    [TStepName in keyof TStepContextMap]: (
      data: unknown
    ) => TStepContextMap[TStepName];
  };
  steps?: (keyof TStepContextMap)[];
}

export type UseFunnelResults<TStepContextMap extends AnyStepContextMap> = {
  Render: (
    props: FunnelRenderComponentProps<TStepContextMap>["steps"]
  ) => JSX.Element;
} & FunnelStepByContextMap<TStepContextMap>;

export function useFunnel<
  _TStepContextMap extends AnyStepContextMap,
  TStepKeys extends keyof _TStepContextMap = keyof _TStepContextMap,
  TStepContext extends _TStepContextMap[TStepKeys] = _TStepContextMap[TStepKeys],
  TStepContextMap extends string extends keyof _TStepContextMap
    ? Record<TStepKeys, TStepContext>
    : _TStepContextMap = string extends keyof _TStepContextMap
    ? Record<TStepKeys, TStepContext>
    : _TStepContextMap
>(
  options: UseFunnelOptions<TStepContextMap>
): UseFunnelResults<TStepContextMap> {
  const optionsRef = useUpdatableRef(options);
  const adapter = useFunnelAdapter(options);
  const currentStateRef = useUpdatableRef(adapter.currentState);

  const history: FunnelHistory<TStepContextMap, keyof TStepContextMap> =
    useMemo(() => {
      const transition = (step: keyof TStepContextMap, assignContext?: any) => {
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
          await adapter.push(nextState);
          return nextState as any;
        },
        replace: async (...args) => {
          const [step, assignContext] = args;
          const nextState = transition(step, assignContext);
          await adapter.replace(nextState);
          return nextState as any;
        },
      };
    }, [adapter.replace, adapter.push, optionsRef]);

  const step = useMemo(
    () => ({
      ...adapter.currentState,
      history,
      beforeSteps: adapter.history.slice(0, adapter.currentIndex),
    }),
    [adapter.currentState, history, adapter.history, adapter.currentIndex]
  );

  const currentStepStoreRef = useStateSubscriberStore(step);

  const Render = useMemo(() => {
    return (props: FunnelRenderComponentProps<TStepContextMap>["steps"]) => {
      const currentStep = useStateStore(currentStepStoreRef);
      return <FunnelRender funnel={currentStep} steps={props} />;
    };
  }, [currentStepStoreRef]);

  return {
    ...step,
    Render,
  };
}
