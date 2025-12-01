'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { UserRole } from '@/types/enums'
import { Menu, LogOut, User, Shield, LayoutDashboard, FileText, Users, Bell } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/ui'

export default function Navbar() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted (client-side only)
  if (!mounted) return null

  // Don't render if session is loading or not available
  if (status === 'loading' || !session) return null

  const getDashboardLink = () => {
    switch (session.user.role) {
      case UserRole.ADMIN:
        return '/admin/dashboard'
      case UserRole.STAFF:
        return '/staff/dashboard'
      case UserRole.RESIDENT:
        return '/resident/dashboard'
      default:
        return '/'
    }
  }

  const roleColors = {
    admin: 'from-purple-500 to-indigo-500',
    staff: 'from-blue-500 to-cyan-500',
    resident: 'from-green-500 to-emerald-500',
  }

  return (
    <nav className="glass border-b border-white/20 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href={getDashboardLink()} className="flex items-center space-x-3 group">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-extrabold gradient-text">CommunityHub</span>
                <p className="text-xs text-gray-500 -mt-1 capitalize">
                  {session.user.role === UserRole.ADMIN ? 'Admin Panel' : 
                   session.user.role === UserRole.STAFF ? 'Staff Portal' : 
                   'Resident Portal'}
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            <Link
              href={getDashboardLink()}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white/50 hover:text-primary-600 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            
            {session.user.role === UserRole.RESIDENT && (
              <>
                <Link
                  href="/resident/announcements"
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white/50 hover:text-primary-600 transition-all"
                >
                  <Bell className="w-4 h-4" />
                  <span>Announcements</span>
                </Link>
                <Link
                  href="/resident/complaints/new"
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white/50 hover:text-primary-600 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>New Complaint</span>
                </Link>
              </>
            )}
            
            {session.user.role === UserRole.ADMIN && (
              <>
        <Link
          href="/admin/dashboard"
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white/50 hover:text-primary-600 transition-all"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white/50 hover:text-primary-600 transition-all"
                >
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </Link>
                <Link
                  href="/admin/announcements"
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white/50 hover:text-primary-600 transition-all"
                >
                  <Bell className="w-4 h-4" />
                  <span>Announcements</span>
                </Link>
              </>
            )}
            
            {session.user.role === UserRole.STAFF && (
              <Link
                href="/staff/complaints"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white/50 hover:text-primary-600 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>My Assignments</span>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            <ThemeToggle />
            <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-white/50 backdrop-blur-sm">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleColors[session.user.role as keyof typeof roleColors] || 'from-gray-400 to-gray-500'} flex items-center justify-center text-white font-bold shadow-lg`}>
                {session.user.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{session.user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{session.user.role}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-white/50 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-2 animate-slide-down">
            <Link
              href={getDashboardLink()}
              className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-white/50 font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            {session.user.role === UserRole.RESIDENT && (
              <Link href="/resident/announcements" className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-white/50 font-semibold" onClick={() => setMobileMenuOpen(false)}>Announcements</Link>
            )}
            {session.user.role === UserRole.ADMIN && (
              <>
                <Link href="/admin/dashboard" className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-white/50 font-semibold" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <Link href="/admin/users" className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-white/50 font-semibold" onClick={() => setMobileMenuOpen(false)}>Users</Link>
                <Link href="/admin/announcements" className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-white/50 font-semibold" onClick={() => setMobileMenuOpen(false)}>Announcements</Link>
              </>
            )}
            <button
              onClick={() => {
                signOut({ callbackUrl: '/auth/signin' })
                setMobileMenuOpen(false)
              }}
              className="w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-semibold"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

