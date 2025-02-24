'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <div style={{ border: '1px solid blue', padding: '10px', backgroundColor: 'lightgray' }}>
      <Link href="/">Home</Link>
    </div>
  );
}
