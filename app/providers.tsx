'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import { ReactNode } from 'react'
import PushNotificationProvider from '@/components/PushNotificationProvider'
import { ThemeProvider } from '@/components/ui'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="light" storageKey="community-theme">
        <PushNotificationProvider>
          {children}
          <Toaster position="top-right" />
        </PushNotificationProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}

