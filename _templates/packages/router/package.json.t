---
to: packages/<%= name %>/package.json
---
{
  "name": "@use-funnel/<%= name %>",
  "version": "0.0.0",
  "description": "",
  "type": "module",
  "main": "./src/index.ts",
  "publishConfig": {
    "main": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "module": "./dist/index.js",
    "exports": {
      ".": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "./package.json": "./package.json"
    }
  },
  "files": [
    "dist",
    "package.json"
  ],
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest --root test/",
    "build": "rimraf dist && concurrently \"pnpm:build:*\"",
    "build:dist": "tsup",
    "build:types": "tsc -p tsconfig.build.json --emitDeclarationOnly",
    "prepublish": "pnpm test && pnpm build",
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@use-funnel/core": "workspace:^"
  },
  "devDependencies": {
    "@testing-library/react": "^15.0.7",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.2",
    "@types/react-dom": "^18.3.0",
    "concurrently": "^8.2.2",
    "globals": "^15.3.0",
    "jsdom": "^24.1.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "rimraf": "^5.0.7",
    "tsup": "^8.0.2",
    "typescript": "^5.1.6",
    "vitest": "^1.6.0"
  },
  "peerDependencies": {
    "react": "^17 || ^18"
  },
  "sideEffects": false
}
