import { Inter } from 'next/font/google';
import './globals.css';
import { ReduxProvider } from '@/store/provider';
import { AuthProvider } from '@/components/AuthProvider';
import { SocketProvider } from '@/components/SocketProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Oasis Chat | Premium Messaging',
  description: 'A production-ready, feature-rich chat application with real-time messaging and voice calling.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ReduxProvider>
          <AuthProvider>
            <SocketProvider>
              <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                {children}
              </div>
            </SocketProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
