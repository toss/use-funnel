export type Prettify<T> = { [K in keyof T]: T[K] } & {};
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
export type CompareMergeContext<TBase, TResult> = Prettify<
  {
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
  }
>;

type PickRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
type TupleLastItem<T extends any[], TFallback = never> = T extends [...infer _, infer R] ? R : TFallback;

type ContextRequiredExtendRule<TProperties extends string> =
  | [step: string, required: TProperties]
  | [step: string]
  | { step: string; required?: TProperties };

type GetContextRequiredExtendRuleStep<T extends ContextRequiredExtendRule<any>> = T extends { step: infer R }
  ? R
  : T extends [infer R]
    ? R
    : T extends [infer R, any]
      ? R
      : never;

type GetContextRequiredExtendRuleRequired<T extends ContextRequiredExtendRule<any>> = T extends { required: infer R }
  ? R
  : T extends [any, infer R]
    ? R
    : never;

export type CreateFunnelStepType<
  TInitialState,
  TRuleTuples extends Array<ContextRequiredExtendRule<keyof TInitialState & string>>,
  Var_ContextTuple extends any[] = [],
  Var_Result = {},
> = Var_ContextTuple['length'] extends TRuleTuples['length']
  ? Prettify<Var_Result>
  : CreateFunnelStepType<
      TInitialState,
      TRuleTuples,
      [
        ...Var_ContextTuple,
        PickRequired<
          TupleLastItem<Var_ContextTuple, TInitialState>,
          GetContextRequiredExtendRuleRequired<TRuleTuples[Var_ContextTuple['length']]>
        >,
      ],
      Var_Result & {
        [K in GetContextRequiredExtendRuleStep<TRuleTuples[Var_ContextTuple['length']]>]: PickRequired<
          TupleLastItem<Var_ContextTuple, TInitialState>,
          GetContextRequiredExtendRuleRequired<TRuleTuples[Var_ContextTuple['length']]>
        >;
      }
    >;
