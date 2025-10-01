import type { JestConfigWithTsJest } from 'ts-jest';
import { defaults as tsjPreset } from 'ts-jest/presets';

const jestConfig: JestConfigWithTsJest = {
  ...tsjPreset,
  testEnvironment: 'jsdom',
  preset: 'ts-jest/presets/default-esm',
  haste: {
    defaultPlatform: 'ios',
    platforms: ['ios', 'android'],
  },
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/node_modules/react-native/jest/setup.js'],
  setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],
  // // Ref: https://github.com/facebook/jest/issues/12984
  transformIgnorePatterns: [`node_modules/(?!(?:.pnpm/)?(@react-native|react-native|@react-navigation))`],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif)$': '<rootDir>/__mocks__/fileMock.js',
    // Ref: https://github.com/kulshekhar/ts-jest/issues/1057
    '(.+)\\.js': '$1',
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};

export default jestConfig;
