import { Sidebar } from '@/components/Sidebar'
import { SidebarWrapper } from '@/components/SidebarWrapper'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
      <main
        style={{ background: 'var(--bg)' }}
        className="flex-1 overflow-y-auto pt-14 md:pt-0"
      >
        {children}
      </main>
    </div>
  )
}
