import Image from 'next/image';
import { Link } from 'nextra-theme-docs';

export const HomePage = ({
  title,
  description,
  buttonText,
  items,
}: {
  title: string;
  description: React.ReactNode;
  buttonText: string;
  items: { title: string; desc: string }[];
}) => {
  return (
    <div className="pb-20 mx-auto max-w-[70rem]">
      <div className="flex flex-col items-center justify-center gap-12 pt-16 text-center">
        <Image src="/logo.png" alt="" width={200} height={200} className="-mb-4" />
        <div className="flex flex-col items-center gap-4">
          <div className="relative text-6xl font-bold">
            <span>{title}</span>
          </div>
          <p className="text-3xl">{description}</p>
        </div>
        <Link href="/docs/introdution">
          <span className="inline-block rounded-xl bg-gray-800 px-10 py-3 text-xl font-bold">{buttonText}</span>
        </Link>
      </div>
      <div className="flex flex-col items-start justify-between gap-8 md:flex-row mt-28">
        {items.map(({ title, desc }) => (
          <div className="flex flex-1 flex-col justify-center gap-3" key={title}>
            <div className="text-xl font-bold">{title}</div>
            <p className="text-lg">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
