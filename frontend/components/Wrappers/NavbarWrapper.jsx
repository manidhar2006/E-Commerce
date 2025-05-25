'use client';

import { Children, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ClientSideNavbarFooter({ children}) {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  // Set mounted state to true once the component is mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if we are on the signup or login page
  const isAuthPage = pathname === '/signup' || pathname === '/login';

  // Render a fallback UI until the component mounts
  if (!isMounted) {
    return (
      <div>
        {/* Render a loading spinner or skeleton UI */}
        Loading...
      </div>
    );
  }

  return (
    <>
      {!isAuthPage && <Navbar />}
      <div>{children}</div>
      {!isAuthPage && <Footer />}
    </>
  );
}