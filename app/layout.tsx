import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ChezFloraAdminDashboard',
  description: 'Created with ChezFloraAdminDashboard',
  generator: 'ChezFloraAdminDashboard.dev',
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
