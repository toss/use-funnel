export const baseTemplate = {
  files: {
    '/hideReactErrorOverlay.css': {
      code: `body > iframe {
  display: none;
}`,
      hidden: true,
    },
    '/index.tsx': {
      hidden: true,
      code: `import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";
const root = createRoot(document.getElementById("root"));
root.render(<App />);
`,
    },
    '/App.tsx': {
      code: `import { Example } from './Example'
      import { BrowserRouter } from "react-router-dom";
import './hideReactErrorOverlay.css'
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';

export default function App() {
  return (
    <Theme>
      <BrowserRouter>
        <Example />
      </BrowserRouter>
    </Theme>
  )
}`,
      hidden: true,
    },
  },
  dependencies: {
    'react-router-dom': '^6',
    '@use-funnel/react-router-dom': 'latest',
    '@radix-ui/themes': '3.1.1',
  },
  devDependencies: {},
};
