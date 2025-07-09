
import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { DashboardLayout } from '@/components/dashboard-layout'
import { ReceiptsProvider } from '@/hooks/use-receipts'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/hooks/use-auth'
import { WarrantiesProvider } from '@/hooks/use-warranties'
import { RemindersProvider } from '@/hooks/use-reminders'

export const metadata: Metadata = {
  title: 'Project Raseed',
  description: 'Manage your receipts and spending with AI.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Malayalam:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <WarrantiesProvider>
              <RemindersProvider>
                <ReceiptsProvider>
                  <DashboardLayout>
                    {children}
                  </DashboardLayout>
                </ReceiptsProvider>
              </RemindersProvider>
            </WarrantiesProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
