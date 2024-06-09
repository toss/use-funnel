import { AnyFunnelState } from './core.js';

export interface FunnelRouterOption<TState extends AnyFunnelState> {
  id: string;
  initialState: TState;
}

export interface FunnelRouterResult<TState extends AnyFunnelState> {
  history: TState[];
  currentIndex: number;
  currentState: TState;
  push: (state: TState) => void | Promise<void>;
  replace: (state: TState) => void | Promise<void>;
  go: (index: number) => void | Promise<void>;
}

export interface FunnelRouter {
  <TState extends AnyFunnelState = AnyFunnelState>(option: FunnelRouterOption<TState>): FunnelRouterResult<TState>;
}
