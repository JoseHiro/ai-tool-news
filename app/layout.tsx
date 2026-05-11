import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Sidebar } from '@/components/Sidebar'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Claude Daily Digest',
  description: 'Claude開発者向け毎日更新ニュースダッシュボード',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      {/* Prevent dark mode flash */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body className="flex h-screen overflow-hidden antialiased">
        <Sidebar />
        <main
          style={{ background: 'var(--bg)' }}
          className="flex-1 overflow-y-auto"
        >
          {children}
        </main>
      </body>
    </html>
  )
}
