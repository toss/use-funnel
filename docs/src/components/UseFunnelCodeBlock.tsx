import { Tabs } from 'nextra/components';
import { useEffect, useRef } from 'react';

export const useFunnelPackages = [
  {
    packageName: 'next',
    packageTitle: 'Next.js page router',
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

export function UseFunnelCodeBlock({ children }: React.PropsWithChildren<unknown>) {
  return (
    <Tabs items={useFunnelPackages.map((p) => p.packageTitle)} storageKey="favorite-package">
      {useFunnelPackages.map((item) => (
        <Tabs.Tab key={item.packageTitle}>
          <UseFunnelImportReplace packageName={item.packageName}>{children}</UseFunnelImportReplace>
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
                token.textContent = token.textContent.replace(targetPackage.packageName, packageName);
              }
            }
          });
        });
    }
  }, [packageName]);
  return <div ref={divRef}>{children}</div>;
}
