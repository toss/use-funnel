import { createUseFunnel } from '@use-funnel/core';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { makePath, removeKeys } from './util';

export * from '@use-funnel/core';

export const useFunnel = createUseFunnel(({ id, initialState }) => {
  const router = useRouter();

  const _currentIndex = Number(router.query?.[`${id}.index`]);
  const currentIndex = isNaN(_currentIndex) ? 0 : _currentIndex;

  const _histories = router.query?.[`${id}.histories`];
  const histories = useMemo<(typeof initialState)[]>(() => {
    try {
      return _histories == null ? [initialState] : JSON.parse(_histories as string);
    } catch {
      return [initialState];
    }
  }, [_histories]);

  return useMemo(
    () => ({
      history: histories,
      currentIndex,
      async push(state) {
        const { pathname, query } = makePath(router);

        await router.push(
          {
            pathname,
            query: {
              ...query,
              [`${id}.histories`]: JSON.stringify([...histories, state]),
              [`${id}.index`]: currentIndex + 1,
            },
          },
          {
            pathname,
            query: { ...removeKeys(query, [`${id}.histories`]), [`${id}.index`]: currentIndex + 1 },
          },
          {
            shallow: true,
          },
        );
      },
      async replace(state) {
        const { pathname, query } = makePath(router);

        await router.replace(
          {
            pathname,
            query: {
              ...query,
              [`${id}.histories`]: JSON.stringify([...(histories ?? []).slice(0, currentIndex), state]),
              [`${id}.index`]: currentIndex + 1,
            },
          },
          {
            pathname,
            query: { ...removeKeys(query, [`${id}.histories`]), [`${id}.index`]: currentIndex + 1 },
          },
          {
            shallow: true,
          },
        );
      },
      go: (index) => window.history.go(index),
    }),
    [router, histories],
  );
});
