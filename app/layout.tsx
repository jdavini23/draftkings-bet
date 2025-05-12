import type { Metadata } from 'next';
import './globals.css';
import { BetRefreshProvider } from '@/hooks/use-bet-refresh';

export const metadata: Metadata = {
  title: 'DraftKings Bet',
  description: 'Smart betting with DraftKings',
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <BetRefreshProvider>{children}</BetRefreshProvider>
      </body>
    </html>
  );
}
