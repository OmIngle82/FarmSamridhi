import type {Metadata} from 'next';
import { Roboto } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { I18nProvider } from '@/contexts/i18n-context';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'FarmSamridhi',
  description: 'A platform connecting farmers, distributors, retailers, and consumers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={roboto.variable}>
      <body className="font-body antialiased">
        <AuthProvider>
            <I18nProvider>
                {children}
            </I18nProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
