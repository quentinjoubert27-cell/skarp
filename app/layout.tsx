import type { Metadata } from 'next'
import { Barlow_Condensed, DM_Sans } from 'next/font/google'
import './globals.css'

const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-barlow',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SKARP — Trouve ton coach, dépasse tes limites.',
  description: 'La marketplace qui connecte les sportifs sérieux aux meilleurs coachs certifiés.',
  openGraph: {
    title: 'SKARP.',
    description: 'La marketplace qui connecte les sportifs sérieux aux meilleurs coachs certifiés.',
    siteName: 'SKARP',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${barlow.variable} ${dmSans.variable}`}>
      <body className="bg-carbon text-white font-sans antialiased">{children}</body>
    </html>
  )
}
