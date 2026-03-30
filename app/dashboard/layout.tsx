'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Fetch unread message count
  useEffect(() => {
    if (status !== 'authenticated') return
    const fetchUnread = () => {
      fetch('/api/messages/unread')
        .then(r => r.json())
        .then(data => setUnreadCount(data.count || 0))
        .catch(() => {})
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  const nav = [
    { href: '/dashboard', label: '🏗️', full: '🏗️ My Builds' },
    { href: '/discover', label: '🔍', full: '🔍 Discover' },
    { href: '/dashboard/messages', label: '💬', full: '💬 Messages' },
    { href: '/dashboard/settings', label: '⚙️', full: '⚙️ Settings' },
  ]

  return (
    <div className="min-h-screen bg-gray-950">

      {/* ── Mobile top bar ── */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-950 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <span className="text-red-500">🔧</span> CarModList
        </Link>
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="text-gray-400 hover:text-white p-2"
          aria-label="Menu"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* ── Mobile dropdown menu ── */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 py-3 space-y-1 z-40">
          {nav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-red-600/20 text-red-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>{item.full}</span>
              {item.href === '/dashboard/messages' && unreadCount > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-800 mt-2">
            <div className="text-xs text-gray-500 mb-2 truncate">{session?.user?.email}</div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      <div className="flex">
        {/* ── Desktop sidebar ── */}
        <aside className="hidden md:flex w-56 border-r border-gray-800 flex-col p-6 min-h-screen sticky top-0 h-screen">
          <Link href="/" className="flex items-center gap-2 mb-8 text-lg font-bold">
            <span className="text-red-500">🔧</span> CarModList
          </Link>

          <nav className="flex-1 space-y-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-red-600/20 text-red-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span>{item.full}</span>
                {item.href === '/dashboard/messages' && unreadCount > 0 && (
                  <span className="bg-red-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="pt-6 border-t border-gray-800">
            <div className="text-sm text-gray-400 mb-3 truncate">{session?.user?.email}</div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 p-4 md:p-8 overflow-auto min-w-0">{children}</main>
      </div>
    </div>
  )
}
