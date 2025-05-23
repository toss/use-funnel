// eslint-disable-next-line @typescript-eslint/no-require-imports
const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  defaultShowCopyCode: true,
  mdxOptions: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    remarkPlugins: [require('remark-sandpack').remarkSandpack],
  },
});

/** @type {import('next').NextConfig} */
module.exports = withNextra({
  i18n: {
    locales: ['ko', 'en'],
    defaultLocale: 'en',
  },
});
