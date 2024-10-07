'use client';
import { OverlayProvider } from 'overlay-kit';
export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <OverlayProvider>{children}</OverlayProvider>;
};
