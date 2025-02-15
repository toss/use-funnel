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
    const contentDescription =
      locale === 'ko'
        ? '모바일 네비게이션에 최적화된 단계별 상태 관리 라이브러리'
        : 'Step-by-step state management library optimized for mobile navigation';

    return (
      <>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="google-site-verification" content="r1VBovAYczFN4z_Mi_wIkBOfQuWV8H05OEPtHmBjolU" />
        <link rel="alternate" hrefLang="ko" href="https://use-funnel.slash.page/ko" />
        <link rel="alternate" hrefLang="en" href="https://use-funnel.slash.page/en" />
        <meta
          property="keywords"
          content="@use-funnel, useFunnel(), funnel, 퍼널 상태관리, 모바일 상태관리, 단계별 상태관리, mobile state, state management, react, navigation, react-native, rn"
        />
        <meta name="description" content={contentDescription} />
        <meta property="og:title" content={title ?? '@use-funnel'} />
        <meta property="og:url" content={url} />
        <meta property="og:description" content={frontMatter.description ?? contentDescription} />
        <meta property="og:image" content="/logo.png" />
        <link rel="icon" href="/favicon.ico" type="image/ico" />
      </>
    );
  },
  project: {
    link: 'https://github.com/toss/use-funnel',
  },
  chat: {
    link: 'https://discord.gg/vGXbVjP2nY'
  },
  docsRepositoryBase: 'https://github.com/toss/use-funnel/tree/main/docs',
  useNextSeoProps() {
    const { asPath } = useRouter();
    if (asPath !== '/' && asPath !== '/ko') {
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
    { locale: 'en', text: 'English' },
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
