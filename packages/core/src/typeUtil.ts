/**
 * TBase에서 TResult로 변환할때, 필수로 필요한 키들을 추출한다.
 * @example RequiredCompareKeys<{a: string, b?: string}, {a: string, b: string}> // 'b'
 */
export type RequiredCompareKeys<TBase, TResult> = {
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

/**
 * TBase에서 TResult로 변환할때, 선택적으로 필요한 키들을 추출한다.
 * @example OptionalCompareKeys<{a: string, b?: string}, {a: string, b: string}> // 'a'
 */
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

/**
 * TBase와 TResult를 비교하여, 필수로 필요한 키들은 TResult의 값을 사용하고,
 * 선택적으로 필요한 키들은 TBase의 값을 사용하여 새로운 객체를 만든다.
 */
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
