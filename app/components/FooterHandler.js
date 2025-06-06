'use client'

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterHandler() {
  const pathname = usePathname();
  const showFooter = !['/login'].includes(pathname);

  if (!showFooter) return null;
  return (
    <Footer />
  );
}