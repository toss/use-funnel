export interface FunnelStepOption<TContext, TMeta = never> {
  meta?: TMeta;
  guard?: (data: unknown) => data is TContext;
  parse?: (data: unknown) => TContext;
}

type FunnelStepMap = Record<string, FunnelStepOption<any, any>>;

class FunnelStepBuilder<TContext, TMeta, TStepMap extends FunnelStepMap = {}> {
  private stepMap: FunnelStepMap = {};
  constructor(private meta?: TMeta) {}
  extends<TName extends string>(
    steps: TName | TName[],
  ): FunnelStepBuilder<
    TContext,
    TMeta,
    TStepMap & {
      [K in TName]: FunnelStepOption<TContext, TMeta>;
    }
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
    }
  >;
  extends<TName extends string, TRequiredKeys extends keyof TContext>(
    steps: TName | TName[],
    options: { requiredKeys: TRequiredKeys[] | TRequiredKeys },
  ): FunnelStepBuilder<
    Omit<TContext, TRequiredKeys> & Pick<Required<TContext>, TRequiredKeys>,
    TMeta,
    TStepMap & {
      [K in TName]: FunnelStepOption<Omit<TContext, TRequiredKeys> & Pick<Required<TContext>, TRequiredKeys>, TMeta>;
    }
  >;
  extends(steps: string | string[], option: any = {}) {
    let funnelStep: FunnelStepOption<any, any>;
    if (option != null && typeof option === 'object' && 'requiredKeys' in option) {
      const requiredKeys = [
        ...(Array.isArray(this.meta) ? this.meta : []),
        ...(Array.isArray(option.requiredKeys) ? option.requiredKeys : [option.requiredKeys]),
      ];
      funnelStep = {
        meta: requiredKeys,
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
    } else {
      funnelStep = typeof option === 'function' ? option(this.meta!) : option;
    }
    for (const step of Array.isArray(steps) ? steps : [steps]) {
      this.stepMap[step] = funnelStep;
    }
    if (funnelStep.meta != null) {
      this.meta = funnelStep.meta as never;
    }
    return this as never;
  }
  build(): TStepMap {
    return this.stepMap as never;
  }
}

export function createFunnelSteps<TContext, TMeta = never>(meta?: TMeta) {
  return new FunnelStepBuilder<TContext, TMeta>(meta);
}
