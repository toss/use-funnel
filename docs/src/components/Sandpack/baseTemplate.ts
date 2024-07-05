export const baseTemplate = {
  files: {
    '/hideReactErrorOverlay.css': {
      code: `body > iframe {
  display: none;
}`,
      hidden: true,
    },
    '/App.tsx': {
      code: `import { Example } from './Example'
import './hideReactErrorOverlay.css'

export default function App() {
  return (
      <Example />
  )
}`,
      hidden: true,
    },
  },
  dependencies: {},
  devDependencies: {},
};
