import { NextRouter } from 'next/router';

export const removeKeys = (_value: Record<string, any>, keys: string[]) => {
  const value = { ..._value };

  keys.forEach((key) => delete value[key]);

  return value;
};

export const makePath = (router: Pick<NextRouter, 'asPath' | 'pathname' | 'query'>) => {
  const { asPath, query: _query } = router;
  const query = { ..._query };

  const pathname = asPath.split('?')[0];

  const pathVariables = [...router.pathname.matchAll(/\[(.+?)\]/g)].map((match) => match[1]);

  pathVariables.forEach((variable) => {
    delete query[variable];
  });

  return { pathname, query };
};
