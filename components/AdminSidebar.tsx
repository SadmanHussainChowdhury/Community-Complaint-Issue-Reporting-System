'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import {
  ClipboardList,
  Users,
  Bell,
  Settings,
  LogOut,
  Shield,
  BarChart3,
  UserCheck,
  TrendingUp,
  User,
  Mail,
  Lock,
  Edit,
  Check,
  X,
  Eye,
  EyeOff,
} from 'lucide-react'
import { SessionUser } from '@/types'
import toast from 'react-hot-toast'

interface AdminSidebarProps {
  user: SessionUser
}

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/residents', label: 'Residents', icon: Users },
  { href: '/admin/resident-cards', label: 'Resident Cards', icon: UserCheck },
  { href: '/admin/complaints', label: 'All Complaints', icon: ClipboardList },
  { href: '/admin/announcements', label: 'Announcements', icon: Bell },
  { href: '/admin/assignments', label: 'Assignments', icon: UserCheck },
  { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

interface ProfileFormData {
  name: string
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState<ProfileFormData>({
    name: user.name || '',
    email: user.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Update form data when user prop changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
    }))
  }, [user])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setIsEditingProfile(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  const handleFormInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateProfileForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Name is required'
    }

    if (!formData.email.trim()) {
      return 'Email is required'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address'
    }

    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        return 'Current password is required to change password'
      }

      if (!formData.newPassword) {
        return 'New password is required'
      }

      if (formData.newPassword.length < 6) {
        return 'New password must be at least 6 characters long'
      }

      if (formData.newPassword !== formData.confirmPassword) {
        return 'New passwords do not match'
      }
    }

    return null
  }

  const handleProfileSave = async () => {
    const validationError = validateProfileForm()
    if (validationError) {
      toast.error(validationError)
      return
    }

    setLoading(true)

    try {
      const updateData: Record<string, string> = {
        name: formData.name,
        email: formData.email,
      }

      if (formData.newPassword) {
        updateData.password = formData.newPassword
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Profile updated successfully')
        setIsEditingProfile(false)
        setIsDropdownOpen(false)

        // Reset password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }))
      } else {
        toast.error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('An error occurred while updating profile')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setIsEditingProfile(false)
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Admin Panel</h1>
            <p className="text-xs text-gray-400">Community Hub</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Admin User Section - Bottom of Sidebar */}
      <div className="relative mt-auto" ref={dropdownRef}>
        <div
          className="px-4 py-3 border-t border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <div className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
            {!isEditingProfile ? (
              /* Profile Display Mode */
              <div className="p-4 space-y-3">
                {/* Profile Info */}
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mx-auto mb-2">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    {user.name || 'Admin User'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {user.email}
                  </p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-900/50 text-purple-300 mt-1">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Profile Edit Mode */
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Edit Profile</h3>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={handleProfileSave}
                      disabled={loading}
                      className="p-1 text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={handleProfileCancel}
                      disabled={loading}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Edit Form */}
                <div className="space-y-3">
                  {/* Name */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFormInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      placeholder="Enter your name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      placeholder="Enter your email"
                    />
                  </div>

                  {/* Current Password */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={(e) => handleFormInputChange('currentPassword', e.target.value)}
                        className="w-full pl-3 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">New Password (Optional)</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={(e) => handleFormInputChange('newPassword', e.target.value)}
                        className="w-full pl-3 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleFormInputChange('confirmPassword', e.target.value)}
                        className="w-full pl-3 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

