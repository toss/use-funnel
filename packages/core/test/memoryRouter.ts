import { useMemo, useState } from 'react';
import { FunnelRouter } from '../src/router.js';

export const MemoryRouter: FunnelRouter = ({ initialState }) => {
  const [history, setHistory] = useState<(typeof initialState)[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  return useMemo(
    () => ({
      history,
      currentIndex,
      currentState: history[currentIndex],
      push(state) {
        setHistory((prev) => [...prev.slice(0, currentIndex + 1), state]);
        setCurrentIndex((prev) => prev + 1);
      },
      replace(state) {
        setHistory((prev) => {
          const newHistory = prev.slice(0, currentIndex + 1);
          newHistory[currentIndex] = state;
          return newHistory;
        });
      },
    }),
    [history, currentIndex],
  );
};
