import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { config, validateConfig, logConfig } from '@/lib/config'

const inter = Inter({ subsets: ['latin'] })

// Validate configuration on app start
try {
  validateConfig();
  logConfig();
} catch (error) {
  console.error('Configuration error:', error);
}

export const metadata: Metadata = {
  title: `${config.app.name} - Powered by Gemini`,
  description: config.app.description,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}