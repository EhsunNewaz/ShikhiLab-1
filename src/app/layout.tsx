
import type {Metadata} from 'next';
import './globals.css';
import { AppHeader } from '@/components/header';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/auth-provider';

export const metadata: Metadata = {
  title: 'ShikhiLab IELTS Master',
  description: 'AI-powered IELTS preparation for Bangladeshi users.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col bg-background">
            <AppHeader />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
