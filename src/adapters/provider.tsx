import { createContext } from 'react';
import { Adapter } from './type.js';

export const FunnelAdapterContext = createContext<Adapter | null>(null);
export function FunnelAdapterProvider({
  adapter,
  children,
}: {
  adapter: Adapter;
  children: React.ReactNode;
}) {
  return (
    <FunnelAdapterContext.Provider value={adapter}>
      {children}
    </FunnelAdapterContext.Provider>
  );
}
