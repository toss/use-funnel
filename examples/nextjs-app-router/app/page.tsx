import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <Link href="/funnel">
        <button>Go to Funnel</button>
      </Link>
    </div>
  );
}
