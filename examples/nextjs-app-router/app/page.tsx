'use client';
import dynamic from 'next/dynamic';
const TestAppRouterFunnel = dynamic(() =>
  import('../src/funnel').then(({ TestAppRouterFunnel }) => TestAppRouterFunnel),
);
export default function Home() {
  //A pre-render error occurs in @use-funnel/browser 0.0.5 version.
  return <TestAppRouterFunnel />;
}
