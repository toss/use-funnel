import { Children } from 'react';

export function CodeCompare({ children }: { children: React.ReactNode }) {
  const childrens = Children.toArray(children);

  if (childrens.length !== 2) {
    throw new Error('CodeCompare must have two children');
  }

  const [before, after] = childrens;

  return (
    <div className="flex flex-col gap-4">
      <h4 className="nx-font-semibold nx-tracking-tight nx-text-slate-900 dark:nx-text-slate-100 nx-mt-4 nx-text-xl -mb-8">
        Before
      </h4>
      {before}
      <h4 className="nx-font-semibold nx-tracking-tight nx-text-slate-900 dark:nx-text-slate-100 nx-text-xl -mb-8">
        After
      </h4>
      {after}
    </div>
  );
}
