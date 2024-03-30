import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Poker',
  description: 'Welcome down to Value Town.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
