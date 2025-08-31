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

interface UseFunnelCodeBlockTabsProps {
  tabItems: typeof useFunnelPackages;
}
export function UseFunnelCodeBlockTabs({ tabItems, children }: React.PropsWithChildren<UseFunnelCodeBlockTabsProps>) {
  return (
    <>
      {tabItems.map((item) => (
        <Tabs.Tab key={item.packageTitle}>
          <UseFunnelImportReplace packageName={item.packageName}>{children}</UseFunnelImportReplace>
        </Tabs.Tab>
      ))}
    </>
  );
}

export function UseFunnelImportReplace({
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
            const matchingPackage = useFunnelPackages.find((pkg) => token.textContent?.includes(pkg.packageName));

            if (!matchingPackage || !token.textContent) return;

            const content = token.textContent.replace(/['"]/g, '');
            const [prefix, packagePath] = content.split('@use-funnel/');

            if (packagePath === matchingPackage.packageName) {
              token.textContent = `"${prefix}@use-funnel/${packageName}"`;
            }
          });
        });
    }
  }, [packageName]);
  return <div ref={divRef}>{children}</div>;
}
