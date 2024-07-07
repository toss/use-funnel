import Image from 'next/image';
import { Link } from 'nextra-theme-docs';
import React from 'react';

export const HomePage = ({
  title,
  description,
  buttonText,
  items,
}: {
  title: string;
  description: string;
  buttonText: string;
  items: { title: string; desc: string }[];
}) => {
  return (
    <div className="pb-20">
      <div className="flex flex-col items-center justify-center gap-8 pt-11 text-center">
        <Image src="/logo.png" alt="Suspensive with star" width={200} height={200} className="-mb-4" />
        <div className="flex flex-col items-center gap-4">
          <div className="relative text-5xl font-bold">
            <span>{title}</span>
          </div>
          <p className="text-3xl">{description}</p>
        </div>
        <Link href="/docs/introdution">
          <span className="inline-block rounded-xl bg-gray-800 px-10 py-3 text-xl font-bold">{buttonText}</span>
        </Link>
      </div>

      <div className="h-14"></div>
      <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
        {items.map(({ title, desc }) => (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center" key={title}>
            <div className="text-xl font-bold">{title}</div>
            <p className="text-lg">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
