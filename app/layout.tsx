import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BrewBase — Support Creators You Love',
  description: 'The warmest way to support your favorite creators.',
  openGraph: {
    title: 'BrewBase',
    description: 'Support creators with one-time tips or monthly memberships.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
        <body className="font-body bg-surface-light text-text-light dark:bg-surface-dark dark:text-text-dark antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
