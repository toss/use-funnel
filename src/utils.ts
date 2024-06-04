import {
  MutableRefObject,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react';

interface Store<T> {
  listeners: VoidFunction[];
  subscribe(listener: VoidFunction): () => void;
  getSnapshot(): T;
}

/**
 * 훅 내부에서 컴포넌트를 만들 때 훅의 상태를 해당 컴포넌트에 전달하고 싶을 때 사용하는 훅
 */
export function useStateSubscriberStore<T>(state: T) {
  const stateRef = useRef(state);
  stateRef.current = state;

  const stateStoreRef = useRef<Store<T>>({
    listeners: [],
    subscribe(listeners) {
      this.listeners.push(listeners);
      return () => {
        this.listeners = this.listeners.filter((fn) => fn !== listeners);
      };
    },
    getSnapshot() {
      return stateRef.current;
    },
  });

  useEffect(() => {
    for (const listener of stateStoreRef.current.listeners) {
      listener();
    }
  }, [state]);

  return stateStoreRef;
}

export function useStateStore<T>(subscriberRef: MutableRefObject<Store<T>>) {
  return useSyncExternalStore(
    subscriberRef.current.subscribe.bind(subscriberRef.current),
    subscriberRef.current.getSnapshot
  );
}

export function useUpdatableRef<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

export function useFixedRef<T>(value: T) {
  const ref = useRef(value);
  if (ref.current !== value) {
    throw new Error('Ref value cannot be changed');
  }
  ref.current = value;
  return ref;
}
