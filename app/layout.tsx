import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Sidebar } from '@/components/Sidebar'
import { SidebarWrapper } from '@/components/SidebarWrapper'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { default: 'DevKnow', template: '%s | DevKnow' },
  description: 'エンジニア向け。AI・個人開発・デイリーダイジェスト。',
  openGraph: {
    siteName: 'DevKnow',
    locale: 'ja_JP',
    type: 'website',
  },
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
        <SidebarWrapper>
          <Sidebar />
        </SidebarWrapper>
        <main
          style={{ background: 'var(--bg)' }}
          className="flex-1 overflow-y-auto pt-14 md:pt-0"
        >
          {children}
        </main>
      </body>
    </html>
  )
}
