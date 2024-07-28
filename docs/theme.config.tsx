import Image from 'next/image';
import { useRouter } from 'next/router.js';
import { type DocsThemeConfig, useConfig } from 'nextra-theme-docs';

const config: DocsThemeConfig = {
  logo: function Logo() {
    return (
      <div className="flex items-center gap-2">
        <Image src="/logo.png" width={25} height={25} alt="@use-funnel logo" />
        <div className="relative">
          <strong>@use-funnel</strong>
        </div>
      </div>
    );
  },
  head: function Head() {
    const { title, frontMatter } = useConfig();
    const { asPath, defaultLocale, locale } = useRouter();
    const url = 'https://use-funnel.slash.page' + (defaultLocale === locale ? asPath : `/${locale}${asPath}`);

    return (
      <>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content={title || '@use-funnel'} />
        <meta property="og:url" content={url} />
        <meta
          property="og:description"
          content={
            frontMatter.description ||
            (locale === 'ko'
              ? '강력하고 안전한 단계별 상태 관리 라이브러리'
              : 'Powerful and safe step-by-step state management library')
          }
        />
        <meta property="og:image" content="/logo.png" />
        <link rel="icon" href="/favicon.ico" type="image/ico" />
      </>
    );
  },
  project: {
    link: 'https://github.com/toss/use-funnel',
  },
  docsRepositoryBase: 'https://github.com/toss/use-funnel/tree/main/docs',
  useNextSeoProps() {
    const { asPath } = useRouter();
    if (asPath !== '/') {
      return {
        titleTemplate: '%s – @use-funnel',
      };
    }
  },
  feedback: { content: '' },
  editLink: {
    text: function Text() {
      const router = useRouter();

      if (router.pathname.includes('.ko')) {
        return <>이 페이지를 수정하기 →</>;
      }

      return <>Edit this page →</>;
    },
  },
  sidebar: {
    titleComponent({ title }) {
      return <>{title}</>;
    },
    defaultMenuCollapseLevel: 4,
    toggleButton: true,
  },
  i18n: [
    // { locale: 'en', text: 'English' },
    { locale: 'ko', text: '한국어' },
  ],
  search: {
    placeholder: function Placeholder() {
      const router = useRouter();

      if (router.pathname.includes('.ko')) {
        return '검색어를 입력하세요...';
      }

      return 'Search documentation...';
    },
  },
  footer: {
    text: 'MIT 2024 © Viva Republica, Inc.',
  },
};

export default config;
