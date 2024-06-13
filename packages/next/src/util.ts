export const removeKeys = (_value: Record<string, any>, keys: string[]) => {
  const value = { ..._value };

  keys.forEach((key) => delete value[key]);

  return value;
};
