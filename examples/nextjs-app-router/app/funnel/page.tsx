import dynamic from 'next/dynamic';
import Header from './header';

const TestAppRouterFunnel = dynamic(
  () => import('../../src/funnel').then(({ TestAppRouterFunnel }) => TestAppRouterFunnel),
  { ssr: false },
);

export default function Funnel() {
  return (
    <>
      <Header />
      <TestAppRouterFunnel />
    </>
  );
}
