// components/HeaderHandler.js
'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Navbar from './Navbar';

export default function HeaderHandler() {
  const pathname = usePathname();
  const showHeader = ['/', '/about', '/contact'].includes(pathname);

  if (!showHeader) return null;

  return (
    <div>
      <Header />
      <Navbar />
    </div>
  );
}