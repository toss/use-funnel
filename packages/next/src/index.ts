import { createUseFunnel } from '@use-funnel/core';
import { NextRouter, useRouter } from 'next/router';
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
    }),
    [router, histories],
  );
});

const makePath = (router: NextRouter) => {
  const { asPath, query: _query } = router;
  const query = { ..._query };

  const pathname = asPath.split('?')[0];

  const pathVariables = [...router.pathname.matchAll(/\[(.+?)\]/g)].map((match) => match[1]);

  pathVariables.forEach((variable) => {
    delete query[variable];
  });

  return { pathname, query };
};
