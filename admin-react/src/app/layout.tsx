import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import env, { validateEnv, logEnvConfig } from '@/config/env';
import './globals.css';

// Validate environment variables on app start
if (typeof window === 'undefined') {
  validateEnv();
  logEnvConfig();
}

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: env.APP_NAME,
  description: env.APP_DESCRIPTION,
  icons: {
    icon: '/fav.png',
    shortcut: '/fav.png',
    apple: '/fav.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SettingsProvider>
            {children}
            <Toaster
              position={env.TOAST.POSITION as 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'}
              toastOptions={{
                duration: env.TOAST.DURATION,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: env.TOAST.DURATION * 0.75,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: env.TOAST.DURATION * 1.25,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}