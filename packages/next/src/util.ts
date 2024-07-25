import { NextRouter } from 'next/router';

export const removeKeys = (_value: Record<string, any>, conditions: (string | ((key: string) => boolean))[]) => {
  const value = { ..._value };
  const valueKeys = Object.keys(value);

  conditions.forEach((condition) => {
    if (typeof condition === 'string') {
      delete value[condition];
    } else {
      valueKeys.forEach((key) => {
        if (condition(key)) {
          delete value[key];
        }
      });
    }
  });

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
