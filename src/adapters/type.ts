import { AnyFunnelState } from 'src/core.js';

export interface AdapterOption<TState extends AnyFunnelState> {
  id: string;
  initialState: TState;
}

export interface AdapterResult<TState extends AnyFunnelState> {
  history: TState[];
  currentIndex: number;
  currentState: TState;
  push: (state: TState) => void | Promise<void>;
  replace: (state: TState) => void | Promise<void>;
  go: (index: number) => void | Promise<void>;
}

export interface Adapter {
  <TState extends AnyFunnelState = AnyFunnelState>(
    option: AdapterOption<TState>
  ): AdapterResult<TState>;
}
