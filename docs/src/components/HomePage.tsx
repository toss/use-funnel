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
    <div className="flex md:h-[calc(100vh-162px)] pt-12">
      <div className="flex flex-col md:h-full md:mr-8">
        <div className="flex flex-col flex-1 md:mb-0 mb-12">
          <Image src="/logo.png" alt="@use-funnel logo" width={140} height={140} />
          <div className="flex flex-col gap-4 mb-12">
            <h1 className="relative text-6xl font-bold">{title}</h1>
            <h2 className="text-2xl leading-normal break-words">{description}</h2>
          </div>
          <div>
            <Link href="/docs/overview">
              <span className="inline-block rounded-xl nx-bg-gray-100 dark:nx-bg-neutral-800 px-10 py-3 text-xl font-bold hover:bg-gray-200">
                {buttonText}
              </span>
            </Link>
          </div>
        </div>

        <div className="flex md:flex-row flex-col justify-between gap-8 items-stretch">
          {items.map(({ title, desc }) => (
            <div
              className="flex flex-1 flex-col items-start gap-3 bg-opacity-10 bg-slate-500 rounded-lg py-4 px-6"
              key={title}
            >
              <div className="text-xl font-bold opacity-80">{title}</div>
              <p className="text-base whitespace-break-spaces opacity-60">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <video
        className="float-right max-w-[40%] invert-video hidden md:block rounded-lg "
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
