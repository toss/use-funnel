import { Suspense } from 'react';
import { OverlayFunnel } from '../../src/overlay/OverlayCaseFunnel';

export default function Page() {
  return (
    <Suspense>
      <OverlayFunnel />;
    </Suspense>
  );
}
