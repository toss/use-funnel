export type FunnelStepGuardOption<TContext> = {
  guard: (data: unknown) => data is TContext;
};

export type FunnelStepParseOption<TContext> = {
  parse: (data: unknown) => TContext;
};

export type FunnelStepOption<TContext> = FunnelStepGuardOption<TContext> | FunnelStepParseOption<TContext>;

export function funnelStepOptionIsGuard<TContext>(
  option: FunnelStepOption<TContext>,
): option is FunnelStepGuardOption<TContext> {
  return 'guard' in option && typeof option.guard === 'function';
}

export function funnelStepOptionIsParse<TContext>(
  option: FunnelStepOption<TContext>,
): option is FunnelStepParseOption<TContext> {
  return 'parse' in option && typeof option.parse === 'function';
}

type FunnelStepMap = Record<string, FunnelStepOption<any> | undefined>;

class SimpleFunnelStepBuilder<
  TContext,
  TStepMap extends FunnelStepMap = {},
  TPrevFunnelStepOption extends FunnelStepGuardOption<TContext> = FunnelStepGuardOption<TContext>,
> {
  private stepMap: FunnelStepMap = {};
  private prevFunnelStepOption: FunnelStepGuardOption<any> | undefined;

  extends<TName extends string>(
    steps: TName | TName[] | Readonly<TName[]>,
  ): SimpleFunnelStepBuilder<
    TContext,
    TStepMap & {
      [K in TName]: TPrevFunnelStepOption;
    },
    TPrevFunnelStepOption
  >;

  extends<TName extends string, TRequiredKeys extends keyof TContext>(
    steps: TName | TName[] | Readonly<TName[]>,
    options: { requiredKeys: TRequiredKeys[] | TRequiredKeys },
  ): SimpleFunnelStepBuilder<
    Omit<TContext, TRequiredKeys> & Pick<Required<TContext>, TRequiredKeys>,
    TStepMap & {
      [K in TName]: FunnelStepGuardOption<Omit<TContext, TRequiredKeys> & Pick<Required<TContext>, TRequiredKeys>>;
    },
    FunnelStepGuardOption<Omit<TContext, TRequiredKeys> & Pick<Required<TContext>, TRequiredKeys>>
  >;

  extends(steps: string | string[], option?: { requiredKeys: string | string[] }) {
    let funnelStep: FunnelStepOption<any> | undefined;
    if (option != null) {
      const requiredKeys = Array.isArray(option.requiredKeys) ? option.requiredKeys : [option.requiredKeys];
      const prevFunnelStepOption = this.prevFunnelStepOption;
      funnelStep = {
        guard: (data): data is never => {
          if (typeof data !== 'object' || data == null) {
            return false;
          }
          if (prevFunnelStepOption != null && !prevFunnelStepOption.guard(data)) {
            return false;
          }
          for (const key of requiredKeys) {
            if (!(key in data)) {
              return false;
            }
          }
          return true;
        },
      };
    } else {
      funnelStep = this.prevFunnelStepOption;
    }
    for (const step of Array.isArray(steps) ? steps : [steps]) {
      this.stepMap[step] = funnelStep;
    }
    this.prevFunnelStepOption = funnelStep;
    return this as never;
  }

  build(): TStepMap {
    return this.stepMap as TStepMap;
  }
}

export function createFunnelSteps<TContext>() {
  return new SimpleFunnelStepBuilder<TContext>();
}
