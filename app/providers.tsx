'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import { ReactNode } from 'react'
import PushNotificationProvider from '@/components/PushNotificationProvider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <PushNotificationProvider>
        {children}
        <Toaster position="top-right" />
      </PushNotificationProvider>
    </SessionProvider>
  )
}

