import { MutableRefObject, useEffect, useRef, useState } from 'react';

interface Store<T> {
  listeners: VoidFunction[];
  subscribe(listener: VoidFunction): () => void;
  getSnapshot(): T;
}

/**
 * A hook used to pass the state of the hook to a component when creating the component inside the hook.
 */
export function useStateSubscriberStore<T>(state: T) {
  const stateRef = useUpdatableRef(state);

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
  const [state, setState] = useState(() => subscriberRef.current.getSnapshot());

  useEffect(() => {
    return subscriberRef.current.subscribe(() => {
      setState(subscriberRef.current.getSnapshot());
    });
  }, [subscriberRef]);

  return state;
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
