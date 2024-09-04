export interface FunnelStepOption<TContext, TMeta = never> {
  meta?: TMeta;
  guard?: (data: unknown) => data is TContext;
  parse?: (data: unknown) => TContext;
}

type FunnelStepMap = Record<string, FunnelStepOption<any, any> | undefined>;

class FunnelStepBuilder<
  TContext,
  TMeta,
  TStepMap extends FunnelStepMap = {},
  TPrevFunnelStepOption extends FunnelStepOption<any, any> = never,
> {
  private stepMap: FunnelStepMap = {};
  private prevFunnelStepOption: FunnelStepOption<any, any> | undefined;

  constructor(private meta?: TMeta) {}
  extends<TName extends string>(
    steps: TName | TName[],
  ): FunnelStepBuilder<
    TContext,
    TMeta,
    TStepMap & {
      [K in TName]: TPrevFunnelStepOption;
    },
    TPrevFunnelStepOption
  >;
  extends<
    TName extends string,
    TFunnelStepOption extends FunnelStepOption<any, any>,
    TNewContext extends TFunnelStepOption extends FunnelStepOption<infer TContext, any> ? TContext : never,
    TNewMeta extends TFunnelStepOption extends FunnelStepOption<any, infer TMeta> ? TMeta : never,
  >(
    steps: TName | TName[],
    option: TFunnelStepOption | ((meta: TMeta) => TFunnelStepOption),
  ): FunnelStepBuilder<
    TNewContext extends unknown ? TContext : TNewContext,
    TNewMeta extends unknown ? TMeta : TNewMeta,
    TStepMap & {
      [K in TName]: TFunnelStepOption;
    },
    TFunnelStepOption
  >;
  extends<TName extends string, TRequiredKeys extends keyof TContext>(
    steps: TName | TName[],
    options: { requiredKeys: TRequiredKeys[] | TRequiredKeys },
  ): FunnelStepBuilder<
    Omit<TContext, TRequiredKeys> & Pick<Required<TContext>, TRequiredKeys>,
    TMeta,
    TStepMap & {
      [K in TName]: FunnelStepOption<Omit<TContext, TRequiredKeys> & Pick<Required<TContext>, TRequiredKeys>, TMeta>;
    },
    FunnelStepOption<Omit<TContext, TRequiredKeys> & Pick<Required<TContext>, TRequiredKeys>, TMeta>
  >;
  extends(steps: string | string[], option?: unknown) {
    let funnelStep: FunnelStepOption<any, any> | undefined;
    if (isRequiredKeys(option)) {
      const requiredKeys = [
        ...(isRequiredKeys(this.meta)
          ? Array.isArray(this.meta.requiredKeys)
            ? this.meta.requiredKeys
            : [this.meta.requiredKeys]
          : []),
        ...(isRequiredKeys(option)
          ? Array.isArray(option.requiredKeys)
            ? option.requiredKeys
            : [option.requiredKeys]
          : []),
      ];
      funnelStep = {
        meta: { requiredKeys },
        guard: (data): data is never => {
          if (typeof data !== 'object' || data == null) {
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
    } else if (option != null) {
      funnelStep = typeof option === 'function' ? option(this.meta!) : option;
    } else {
      funnelStep = this.prevFunnelStepOption;
    }
    for (const step of Array.isArray(steps) ? steps : [steps]) {
      this.stepMap[step] = funnelStep;
    }
    if (funnelStep?.meta != null) {
      this.meta = funnelStep.meta as never;
    }
    this.prevFunnelStepOption = funnelStep;
    return this as never;
  }
  build(): TStepMap {
    return this.stepMap as never;
  }
}

function isRequiredKeys(meta: unknown): meta is { requiredKeys: string[] | string } {
  return typeof meta === 'object' && meta != null && 'requiredKeys' in meta;
}

export function createFunnelSteps<TContext, TMeta = never>(meta?: TMeta) {
  return new FunnelStepBuilder<TContext, TMeta>(meta);
}
