import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { FunnelAdapterContext } from "./adapters/provider.js";
import { Adapter } from "./adapters/type.js";
import { AnyStepContextMap, FunnelStep, State } from "./core.js";
import { FunnelRender, FunnelRenderComponentProps } from "./FunnelRender.js";
import {
  makeUniqueId,
  useFixedRef,
  useStateStore,
  useStateSubscriberStore,
  useUpdatableRef,
} from "./utils.js";

export interface UseFunnelOptions<TStepContextMap extends AnyStepContextMap> {
  id: string;
  contextGuard?: {
    [TStepName in keyof TStepContextMap]: (
      data: unknown
    ) => TStepContextMap[TStepName];
  };
  steps?: (keyof TStepContextMap)[];
  initial: {
    [key in keyof TStepContextMap]: Omit<
      State<key, TStepContextMap[key]>,
      "id"
    >;
  }[keyof TStepContextMap];
  adapter?: Adapter;
}

export function useFunnel<
  _TStepContextMap extends AnyStepContextMap,
  TStepKeys extends keyof _TStepContextMap = keyof _TStepContextMap,
  TStepContext extends _TStepContextMap[TStepKeys] = _TStepContextMap[TStepKeys],
  TStepContextMap extends string extends keyof _TStepContextMap
    ? Record<TStepKeys, TStepContext>
    : _TStepContextMap = string extends keyof _TStepContextMap
    ? Record<TStepKeys, TStepContext>
    : _TStepContextMap
>(options: UseFunnelOptions<TStepContextMap>) {
  const optionsRef = useUpdatableRef(options);
  const { adapter: _useAdapter, id } = options;

  const useAdapterFromContext = useContext(FunnelAdapterContext);
  const useAdapter = useFixedRef(_useAdapter ?? useAdapterFromContext).current;
  if (useAdapter == null) {
    throw new Error("Adapter is required");
  }

  const [initialState] = useState(() => ({
    ...options.initial,
    id: makeUniqueId(),
  }));
  const { currentIndex, currentState, replace, push, history } = useAdapter({
    id,
    initialState,
  });

  const currentStateRef = useUpdatableRef(currentState);

  const transition = useCallback(
    async <TName extends TStepKeys>(
      stateName: TName,
      assignContext: any,
      isReplace = false
    ) => {
      const newContext = {
        ...currentStateRef.current.context,
        ...assignContext,
      } as TStepContextMap[TName];
      const nextState = {
        id: makeUniqueId(),
        step: stateName,
        context: optionsRef.current.contextGuard?.[stateName]
          ? optionsRef.current.contextGuard[stateName](newContext)
          : newContext,
      } as State<TName, TStepContextMap[TName]>;
      if (isReplace) {
        await replace(nextState);
      } else {
        await push(nextState);
      }
      return nextState;
    },
    [replace, push]
  );

  const step: {
    [TStepKey in TStepKeys]: FunnelStep<TStepContextMap, TStepKey>;
  }[TStepKeys] = useMemo(
    () =>
      ({
        ...(currentState as any),
        history: {
          push: (name, context) =>
            transition(name as unknown as TStepKeys, context),
          replace: (name, context) =>
            transition(name as unknown as TStepKeys, context, true),
        },
        beforeSteps: history.slice(0, currentIndex),
      } as FunnelStep<TStepContextMap, TStepKeys>),
    [currentState, transition, history, currentIndex]
  );

  const currentStepStoreRef = useStateSubscriberStore(step);

  const Render = useMemo(() => {
    return (props: FunnelRenderComponentProps<TStepContextMap>["steps"]) => {
      const currentStep = useStateStore(currentStepStoreRef);
      return <FunnelRender funnel={currentStep as any} steps={props} />;
    };
  }, [currentStepStoreRef]);

  return {
    ...step,
    Render,
  };
}
