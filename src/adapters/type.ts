import { AnyState } from "src/core.js";

export interface AdapterOption<TState extends AnyState> {
  id: string;
  initialState: TState;
}

export interface AdapterResult<TState extends AnyState> {
  history: TState[];
  currentIndex: number;
  currentState: TState;
  push: (state: TState) => Promise<void>;
  replace: (state: TState) => Promise<void>;
  go: (index: number) => Promise<void>;
}

export interface Adapter {
  <TState extends AnyState = AnyState>(
    option: AdapterOption<TState>
  ): AdapterResult<TState>;
}
