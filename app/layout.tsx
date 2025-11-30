import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { BillingProvider } from '@/contexts/billing-context'
import InactivityMonitor from '@/components/inactivity-monitor'
import { Toaster } from '@/components/toaster'

export const metadata: Metadata = {
  title: 'LawCentrAI - Legal Case Management',
  description: 'AI-powered legal case management system',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

        {/* Favicon */}
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />

        {/* Microsoft Clarity Analytics */}
        {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID && (
          <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");
              `,
            }}
          />
        )}
      </head>
      <body>
        <AuthProvider>
          <BillingProvider>
            {children}
            <InactivityMonitor />
            <Toaster />
          </BillingProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
