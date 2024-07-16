import { Tabs } from 'nextra/components';
import { useEffect, useRef } from 'react';

export const useFunnelPackages = ['next', 'react-router-dom', 'react-navigation-native', 'browser'];

export function UseFunnelCodeBlock({ children }: React.PropsWithChildren<unknown>) {
  return (
    <Tabs items={useFunnelPackages} storageKey="favorite-package">
      {useFunnelPackages.map((item) => (
        <Tabs.Tab key={item}>
          <UseFunnelImportReplace packageName={item}>{children}</UseFunnelImportReplace>
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
              if (token.textContent?.includes(targetPackage)) {
                token.textContent = token.textContent.replace(targetPackage, packageName);
              }
            }
          });
        });
    }
  }, [packageName]);
  return <div ref={divRef}>{children}</div>;
}
