import type { Metadata } from 'next'
import { Inter, Permanent_Marker } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const permanentMarker = Permanent_Marker({ weight: '400', subsets: ['latin'], variable: '--font-permanent-marker' })

export const metadata: Metadata = {
  title: 'Smarty Chat',
  description: 'A robust communication platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${permanentMarker.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

