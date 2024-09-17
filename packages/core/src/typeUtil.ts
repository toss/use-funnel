export type Prettify<T> = Omit<T, never>;
/**
 * Extracts the keys that are required when converting from TBase to TResult.
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
    : never;
}[keyof TBase | keyof TResult];

/**
 * Extracts the keys that are optional when converting from TBase to TResult.
 * @example OptionalCompareKeys<{a: string, b?: string}, {a: string, b: string}> // 'a'
 */
export type OptionalCompareKeys<TBase, TResult> = {
  [K in keyof TBase | keyof TResult]: K extends keyof TResult
    ? K extends keyof TBase
      ? TBase[K] extends TResult[K]
        ? K
        : never
      : undefined extends TResult[K]
        ? K
        : never
    : K extends keyof TBase
      ? K
      : never;
}[keyof TBase | keyof TResult];

/**
 * Compares TBase with TResult to create a new object that uses TResult's values for required keys,
 * and TBase's values for optional keys.
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
