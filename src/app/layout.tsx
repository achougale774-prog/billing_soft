import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import TopHeader from '@/components/TopHeader';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'RC Chicken65',
  description: 'Billing System for RC Chicken65',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mr">
      <body className="antialiased bg-gray-50 max-w-md mx-auto min-h-screen shadow-lg relative pb-[72px]">
        <Toaster position="top-center" richColors />
        <TopHeader />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
