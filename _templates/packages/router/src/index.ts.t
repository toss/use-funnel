---
to: packages/<%= name %>/src/index.ts
---
import { createUseFunnel } from '@use-funnel/core';
import { useMemo } from 'react';

export * from '@use-funnel/core';

export const useFunnel = createUseFunnel(({ id, initialState }) => {
  const history = useMemo(() => [], []);
  const currentIndex = 0;
  return useMemo(
    () => ({
      history,
      currentIndex,
      push(state) {
        throw new Error('Not implemented');
      },
      replace(state) {
        throw new Error('Not implemented');
      },
    }),
    [history, currentIndex],
  );
});
