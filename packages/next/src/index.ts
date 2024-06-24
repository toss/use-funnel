import { createUseFunnel } from '@use-funnel/core';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { removeKeys } from './util';

export * from '@use-funnel/core';

export const useFunnel = createUseFunnel(({ id, initialState }) => {
  const router = useRouter();

  const currentIndex = isNaN(Number(router.query?.[`${id}.index`])) ? 0 : Number(router.query?.[`${id}.index`]);
  const _histories = router.query?.[`${id}.histories`];
  const histories = useMemo<(typeof initialState)[]>(() => {
    try {
      return _histories == null ? [initialState] : JSON.parse(_histories as string);
    } catch {
      return [initialState];
    }
  }, [currentIndex, _histories]);

  return useMemo(
    () => ({
      history: histories,
      currentIndex,
      currentState: histories[currentIndex],
      async push(state) {
        await router.push(
          {
            query: {
              ...router.query,
              [`${id}.histories`]: JSON.stringify([...histories, state]),
              [`${id}.index`]: currentIndex + 1,
            },
          },
          {
            query: { ...removeKeys(router.query, [`${id}.histories`]), [`${id}.index`]: currentIndex + 1 },
          },
          {
            shallow: true,
          },
        );
      },
      async replace(state) {
        await router.replace(
          {
            query: {
              ...router.query,
              [`${id}.histories`]: JSON.stringify([...(histories ?? []).slice(0, currentIndex), state]),
              [`${id}.index`]: currentIndex + 1,
            },
          },
          {
            query: { ...removeKeys(router.query, [`${id}.histories`]), [`${id}.index`]: currentIndex + 1 },
          },
          {
            shallow: true,
          },
        );
      },
    }),
    [router, histories],
  );
});
