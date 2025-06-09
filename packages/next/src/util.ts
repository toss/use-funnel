import Router, { NextRouter } from 'next/router';

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

export function parseQueryJson(data: string) {
  return JSON.parse(data, (_, value) => {
    if (typeof value === 'object' && value !== null && '__type' in value && value.__type === 'Date') {
      return new Date(value.value);
    }
    return value;
  });
}

export function stringifyQueryJson(data: unknown) {
  return JSON.stringify(data, (_, value) => {
    if (typeof value === 'object' && value != null) {
      for (const key in value) {
        /**
         * Safe hasOwnProperty check for objects that don't inherit from Object.prototype.
         * Uses call() to invoke hasOwnProperty from Object.prototype directly,
         * avoiding TypeError when object doesn't inherit from Object.prototype.
         * @see https://github.com/toss/use-funnel/issues/152
         */
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          if (value[key] instanceof Date) {
            value[key] = {
              __type: 'Date',
              value: value[key].toISOString(),
            };
          }
        }
      }
    }
    return value;
  });
}

export function waitForRouterReady() {
  return new Promise<void>((resolve) => {
    Router.ready(resolve);
  });
}
