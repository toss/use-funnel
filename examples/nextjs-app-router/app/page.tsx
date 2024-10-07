import { Suspense } from 'react';
import { TestAppRouterFunnel } from '~/src/funnel';

export default function Home() {
  return (
    <Suspense>
      <TestAppRouterFunnel />
    </Suspense>
  );
}
