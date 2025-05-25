"use client";

import { Geist, Geist_Mono } from 'next/font/google';
import ThemeProviderWrapper from "@/components/Wrappers/ThemeProviderWrapper"; // Import the wrapper
import dynamic from 'next/dynamic';
import './globals.css';


const NavbarFooterWrapper = dynamic(
  () => import('@/components/Wrappers/NavbarWrapper'),
  { ssr: false }
);


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({children}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProviderWrapper> {/* Wrap with ThemeProvider */}
          <NavbarFooterWrapper>{children}</NavbarFooterWrapper>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}