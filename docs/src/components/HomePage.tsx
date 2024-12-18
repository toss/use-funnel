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
    <div className="flex h-[calc(100vh-162px)] pt-12">
      <div className="flex flex-col h-full mr-8">
        <div className="flex flex-col flex-1">
          <Image src="/logo.png" alt="@use-funnel logo" width={160} height={160} />
          <div className="flex flex-col gap-4 mb-12">
            <div className="relative text-6xl font-bold">
              <span>{title}</span>
            </div>
            <p className="text-3xl leading-normal whitespace-pre">{description}</p>
          </div>
          <div>
            <Link href="/docs/overview">
              <span className="inline-block rounded-xl nx-bg-gray-100 dark:nx-bg-neutral-800 px-10 py-3 text-xl font-bold hover:bg-gray-200">
                {buttonText}
              </span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-8 md:flex-row items-stretch">
          {items.map(({ title, desc }) => (
            <div
              className="flex flex-1 flex-col items-start gap-3 bg-opacity-10 bg-slate-500 rounded-xl p-4"
              key={title}
            >
              <div className="text-xl font-bold">{title}</div>
              <p className="text-base whitespace-break-spaces">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <video
        className="float-right max-w-[40%] invert-video hidden md:block"
        src="/example.mp4"
        poster="/overlay.png"
        height="100%"
        playsInline
        muted
        autoPlay
        loop
      />
    </div>
  );
};
