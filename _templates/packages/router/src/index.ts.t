---
to: packages/<%= name %>/src/index.ts
---
import { createUseFunnel } from '@use-funnel/core';
import { useMemo } from 'react';

export * from '@use-funnel/core';

export const useFunnel = createUseFunnel(({ id, initialState }) => {
  return useMemo(
    () => ({
      history: [],
      currentIndex: 0,
      currentState: initialState,
      push(state) {
        throw new Error('Not implemented');
      },
      replace(state) {
        throw new Error('Not implemented');
      },
    }),
    [],
  );
});
