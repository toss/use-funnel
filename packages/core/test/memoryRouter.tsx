import { createContext, useContext, useMemo, useState } from 'react';
import { FunnelRouter } from '../src/router.js';
import { createUseFunnel } from '../src/useFunnel.js';

interface MemoryRouterOption {
  __foo?: 'bar';
}

interface Context {
  history: Record<string, any>;
  push(data: Record<string, any>): void;
  replace(data: Record<string, any>): void;
  go: (delta: number) => void;
}

const MemoryRouterContext = createContext<undefined | Context>(undefined);

export function MemoryRouterProvider(props: React.PropsWithChildren) {
  const [history, setHistory] = useState<Record<string, any>[]>([{}]);
  const [index, setIndex] = useState(0);
  const currentHistory = history[index];
  const context: Context = useMemo(
    () => ({
      history: currentHistory,
      all: {
        history,
        index,
      },
      push: (data) => {
        setHistory((prev) => [...prev.slice(0, index + 1), { ...currentHistory, ...data }]);
        setIndex((prev) => prev + 1);
      },
      replace: (data) => {
        setHistory((prev) => [...prev.slice(0, index), { ...currentHistory, ...data }]);
      },
      go: (delta) => setIndex((prev) => prev + delta),
    }),
    [currentHistory, index],
  );
  return <MemoryRouterContext.Provider value={context}>{props.children}</MemoryRouterContext.Provider>;
}

export const MemoryRouter: FunnelRouter<MemoryRouterOption> = ({ id, initialState }) => {
  const memoryRouter = useContext(MemoryRouterContext);
  if (memoryRouter == null) {
    throw new Error('MemoryRouterProvider should be installed');
  }

  const historyKey = `${id}.history`;
  const indexKey = `${id}.index`;

  const context = useMemo(() => {
    if (!memoryRouter.history[historyKey] || !memoryRouter.history[indexKey]) {
      return {
        history: [initialState],
        index: 0,
      };
    }
    return {
      history: memoryRouter.history[historyKey],
      index: memoryRouter.history[indexKey],
    };
  }, [memoryRouter, id, initialState]) as {
    index: number;
    history: any[];
  };

  return useMemo(
    () => ({
      history: context.history,
      currentIndex: context.index,
      currentState: context.history[context.index],
      push(state) {
        memoryRouter.push({
          [indexKey]: context.index + 1,
          [historyKey]: [...context.history.slice(0, context.index + 1), state],
        });
      },
      replace(state) {
        memoryRouter.replace({
          [indexKey]: context.index,
          [historyKey]: [...context.history.slice(0, context.index), state],
        });
      },
      go: (index) => {
        memoryRouter.go(index);
      },
      cleanup() {
        memoryRouter.replace({
          [indexKey]: undefined,
          [historyKey]: undefined,
        });
      },
    }),
    [context, memoryRouter],
  );
};

export const useFunnel = createUseFunnel<MemoryRouterOption>(MemoryRouter);
