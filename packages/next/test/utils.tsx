import { render } from '@testing-library/react';
import { ReactNode, Suspense, useEffect } from 'react';
import { vi } from 'vitest';

export function renderWithSuspense() {
  const isSuspended = vi.fn(() => null);

  const FallbackComponent = ({ children }: { children: ReactNode }) => {
    isSuspended();
    return <>{children}</>;
  };

  const withSuspense = (children: ReactNode, { fallback }: { fallback: ReactNode }) => {
    return <Suspense fallback={<FallbackComponent>{fallback}</FallbackComponent>}>{children}</Suspense>;
  };

  return {
    withSuspense,
    checkDidSuspend: () => isSuspended.mock.calls.length > 0,
  };
}
