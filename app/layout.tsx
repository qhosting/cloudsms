
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { ImpersonationBanner } from '@/components/impersonation-banner';
import { ImpersonationLayoutWrapper } from '@/components/impersonation-layout-wrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SMS CloudMX - Plataforma de Marketing por SMS',
  description: 'Plataforma SaaS para campañas de marketing por SMS. Gestiona tus contactos, crea campañas personalizadas y monitorea el rendimiento de tus mensajes.',
  keywords: 'SMS, marketing, campañas, mensajería, SaaS, México',
  authors: [{ name: 'SMS CloudMX' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ImpersonationBanner />
          <ImpersonationLayoutWrapper>
            {children}
          </ImpersonationLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
