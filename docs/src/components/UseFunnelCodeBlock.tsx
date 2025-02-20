import { Tabs } from 'nextra/components';
import { useEffect, useRef } from 'react';

export const useFunnelPackages = [
  {
    packageName: 'browser',
    packageTitle: 'Next.js app router',
  },
  {
    packageName: 'next',
    packageTitle: 'Next.js page router',
  },
  {
    packageName: 'react-router',
    packageTitle: 'react-router',
  },
  {
    packageName: 'react-router-dom',
    packageTitle: 'react-router-dom',
  },
  {
    packageName: 'react-navigation-native',
    packageTitle: '@react-navigation/native',
  },
  {
    packageName: 'browser',
    packageTitle: 'browser history api',
  },
];

interface UseFunnelCodeBlockProps {
  renderSupplement?: ({ packageTitle }: { packageTitle: string }) => React.ReactNode;
}

export function UseFunnelCodeBlock({
  children,
  renderSupplement: RenderSupplement,
}: React.PropsWithChildren<UseFunnelCodeBlockProps>) {
  return (
    <Tabs items={useFunnelPackages.map((p) => p.packageTitle)} storageKey="favorite-package">
      {useFunnelPackages.map((item) => (
        <Tabs.Tab key={item.packageTitle}>
          <UseFunnelImportReplace packageName={item.packageName}>{children}</UseFunnelImportReplace>
          {RenderSupplement && <RenderSupplement packageTitle={item.packageTitle} />}
        </Tabs.Tab>
      ))}
    </Tabs>
  );
}

function UseFunnelImportReplace({
  children,
  packageName,
}: React.PropsWithChildren<{
  packageName: string;
}>) {
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (divRef.current != null) {
      Array.from(divRef.current.querySelectorAll('.line'))
        .filter((line) => {
          const tokens = Array.from(line.querySelectorAll('[style*="token-keyword"]'));
          return tokens.some((token) => token.textContent === 'import') && line.textContent?.includes('@use-funnel/');
        })
        .forEach((line) => {
          const tokens = Array.from(line.querySelectorAll('[style*="token-string-expression"]'));
          tokens.forEach((token) => {
            for (const targetPackage of useFunnelPackages) {
              if (token.textContent?.includes(targetPackage.packageName)) {
                const content = token.textContent.replace(/['"]/g, '');
                const [prefix, packagePath] = content.split('@use-funnel/');

                if (packagePath === targetPackage.packageName) {
                  token.textContent = `"${prefix}@use-funnel/${packageName}"`;
                }
              }
            }
          });
        });
    }
  }, [packageName]);
  return <div ref={divRef}>{children}</div>;
}
