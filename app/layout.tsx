import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppLayout } from '@/components/layout/AppLayout'
import { OfflineProvider } from '@/components/providers/OfflineProvider'

export const viewport: Viewport = {
  themeColor: '#f43f5e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'SweetFlow AI — WhatsApp CRM & Billing for Bakeries',
  description: 'Premium AI-powered WhatsApp CRM, order management, and billing solution for modern bakeries and cake shops.',
  keywords: 'bakery crm, whatsapp business, cake shop management, billing saas, sweetflow',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SweetFlow AI',
  },
  openGraph: {
    title: 'SweetFlow AI',
    description: 'AI-powered CRM + Billing SaaS for Bakeries',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        <OfflineProvider>
          <AppLayout>{children}</AppLayout>
        </OfflineProvider>
      </body>
    </html>
  )
}

