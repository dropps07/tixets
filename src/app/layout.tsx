import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { ThemeProvider } from 'next-themes';
import { Web3Provider } from '@/context/Web3Context';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'tixets',
  description: 'Decentralized Event Ticketing Platform',
  icons: {
    icon: './favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="./favicon.ico" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class">
          <Web3Provider>
            <Navbar />
            <main className="bg-black">{children}</main>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}