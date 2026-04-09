import '../styles/globals.css';

import type { AppProps } from 'next/app';
import { Tooltip } from 'react-tooltip';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Tooltip style={{ maxWidth: '90%' }} anchorSelect={`.keyword-tooltip`} />
    </>
  );
}
