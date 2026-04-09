import nextra from 'nextra';
import { remarkSandpack } from 'remark-sandpack';

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  defaultShowCopyCode: true,
  mdxOptions: {
    remarkPlugins: [remarkSandpack],
  },
});

/** @type {import('next').NextConfig} */
export default withNextra({
  async redirects() {
    return [
      {
        source: '/docs/:path*',
        destination: '/en/docs/:path*',
        permanent: true,
      },
    ];
  },
});
