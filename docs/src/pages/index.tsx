import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const acceptLanguage = req.headers['accept-language'] ?? '';
  const locale = acceptLanguage.includes('ko') ? 'ko' : 'en';
  return {
    redirect: {
      destination: `/${locale}`,
      permanent: false,
    },
  };
};

export default function Index() {
  return null;
}
