import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import InactivityMonitor from '@/components/inactivity-monitor'
import { Toaster } from '@/components/toaster'

export const metadata: Metadata = {
  title: 'CasePilot - Legal Case Management',
  description: 'AI-powered legal case management system',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
            <AuthProvider>
      {children}
      <InactivityMonitor />
      <Toaster />
    </AuthProvider>
      </body>
    </html>
  )
}
