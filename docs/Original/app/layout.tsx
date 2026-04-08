import type { Metadata } from 'next'
import { Geologica } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geologica = Geologica({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Optimixage - Iniciar Sesión',
  description: 'Inicia sesión en Optimixage',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geologica.className} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
