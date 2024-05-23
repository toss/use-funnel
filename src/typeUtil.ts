// TBase에서 TResult로 변환할때, 필수로 필요한 키들을 추출한다.
type RequiredCompareKeys<TBase, TResult> = {
  [K in keyof TBase | keyof TResult]: K extends keyof TResult
    ? K extends keyof TBase
      ? TBase[K] extends TResult[K]
        ? never
        : K
      : undefined extends TResult[K]
      ? never
      : K
    : K extends keyof TBase
    ? never
    : never;
}[keyof TBase | keyof TResult];

type OptionalCompareKeys<TBase, TResult> = {
  [K in keyof TBase | keyof TResult]: K extends keyof TResult
    ? K extends keyof TBase
      ? TBase[K] extends TResult[K]
        ? K
        : never
      : undefined extends TResult[K]
      ? K
      : never
    : K extends keyof TBase
    ? never
    : never;
}[keyof TBase | keyof TResult];

export type CompareMergeContext<TBase, TResult> = {
  [K in RequiredCompareKeys<TBase, TResult>]: K extends keyof TResult
    ? TResult[K]
    : K extends keyof TBase
    ? TBase[K]
    : never;
} & {
  [K in OptionalCompareKeys<TBase, TResult>]?: K extends keyof TBase
    ? TBase[K]
    : K extends keyof TResult
    ? TResult[K]
    : never;
};
