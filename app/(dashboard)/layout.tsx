import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Coffee, LayoutDashboard, Settings, ExternalLink, Trophy, BarChart2 } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const clerkUser = await currentUser()
  let username = ''

  if (clerkUser) {
    const { data } = await supabaseAdmin()
      .from('users')
      .select('username')
      .eq('clerk_id', clerkUser.id)
      .single()
    username = data?.username || ''
  }

  return (
    <div className="min-h-screen bg-surface-light flex">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border-light bg-surface-card hidden md:flex flex-col fixed h-full">
        <div className="p-5 border-b border-border-light">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center">
              <Coffee className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-text-light">BrewBase</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-light hover:bg-orange-100 transition-colors"
            >
              <Icon className="w-4 h-4 text-brand-primary" />
              {label}
            </Link>
          ))}

          {username && (
            <Link
              href={`/${username}`}
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-light hover:bg-orange-100 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-brand-primary" />
              View my page
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-border-light flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-light truncate">
              {clerkUser?.firstName || 'Creator'}
            </p>
            <p className="text-xs text-text-muted truncate">@{username || '...'}</p>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 bg-surface-card border-b border-border-light px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-primary flex items-center justify-center">
            <Coffee className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-text-light">BrewBase</span>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map(({ href, icon: Icon }) => (
            <Link key={href} href={href} className="p-2 rounded-lg hover:bg-orange-100 transition-colors">
              <Icon className="w-4 h-4 text-brand-primary" />
            </Link>
          ))}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      <main className="flex-1 md:ml-60 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}
