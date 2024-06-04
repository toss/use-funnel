import { useContext, useState } from 'react';
import { FunnelAdapterContext } from './adapters/provider.js';
import { Adapter } from './adapters/type.js';
import { AnyStepContextMap, FunnelStateByContextMap } from './core.js';
import { useFixedRef } from './utils.js';

export interface UseFunnelAdapterOptions<
  TStepContextMap extends AnyStepContextMap,
> {
  id: string;
  initial: FunnelStateByContextMap<TStepContextMap>;
  adapter?: Adapter;
}

/**
 * `Adapter` 타입은 Custom Hook으로 구성되어 있어서, 이러한 훅을 외부에서 주입하기 때문에, 변경이 감지될 경우 에러를 발생시킵니다.
 * @param adapter
 */
export function useFunnelAdapter<TStepContextMap extends AnyStepContextMap>(
  options: UseFunnelAdapterOptions<TStepContextMap>
) {
  const useAdapterFromContext = useContext(FunnelAdapterContext);
  const useAdapter = useFixedRef(
    options.adapter ?? useAdapterFromContext
  ).current;
  if (useAdapter == null) {
    throw new Error(
      'Adapter is required. Please pass the adapter to the useFunnel or install FunnelAdapterProvider.'
    );
  }
  const [initialState] = useState<FunnelStateByContextMap<TStepContextMap>>(
    () => options.initial
  );
  return useAdapter({
    id: options.id,
    initialState,
  });
}
