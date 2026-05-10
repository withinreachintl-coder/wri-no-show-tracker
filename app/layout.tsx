import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dmsans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'No-Show Tracker',
  description: 'Track restaurant staff no-shows, lates, and walk-offs in one tap.',
}

function Footer() {
  return (
    <footer className="border-t border-stone-800 px-6 py-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <span className="font-dmsans text-sm text-stone-500">
          Built for independent restaurants, by an independent restaurant owner.
        </span>
        <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
          <a href="https://wireach.tools/privacy" className="font-dmsans text-sm text-stone-500 inline-flex items-center min-h-[44px] px-1">Privacy</a>
          <a href="https://wireach.tools/terms" className="font-dmsans text-sm text-stone-500 inline-flex items-center min-h-[44px] px-1">Terms</a>
          <a href="mailto:support@wireach.tools" className="font-dmsans text-sm text-stone-500 inline-flex items-center min-h-[44px] px-1">Support</a>
          <a href="https://wireach.tools" className="wri-suite-link font-dmsans text-sm text-stone-400 inline-flex items-center min-h-[44px] px-1 transition-colors">Part of WRI Suite →</a>
        </div>
      </div>
      <p className="mt-4 font-dmsans text-xs text-stone-500">
        Within Reach International LLC · Memphis, TN
      </p>
    </footer>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable}`}>
        {children}
        <Footer />
      </body>
    </html>
  )
}
