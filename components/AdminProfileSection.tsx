'use client'

import { useState, useEffect } from 'react'
import { SessionUser } from '@/types'
import { User, Mail, Lock, Edit, Check, X, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminProfileSectionProps {
  user: SessionUser
  onProfileUpdate?: (updatedUser: SessionUser) => void
}

interface ProfileFormData {
  name: string
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function AdminProfileSection({ user, onProfileUpdate }: AdminProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Name is required'
    }

    if (!formData.email.trim()) {
      return 'Email is required'
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address'
    }

    // Password validation (only if user wants to change password)
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

  const handleSave = async () => {
    const validationError = validateForm()
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

      // Only include password if user wants to change it
      if (formData.newPassword) {
        updateData.password = formData.newPassword
        updateData.currentPassword = formData.currentPassword
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

        // Update local user state
        const updatedUser = {
          ...user,
          name: formData.name,
          email: formData.email,
        }

        onProfileUpdate?.(updatedUser)

        // Reset password fields and exit edit mode
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }))

        setIsEditing(false)
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

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      name: user.name || '',
      email: user.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-200">Edit Profile</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="p-1 text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="p-1 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            {/* Name */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Current Password */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">New Password (Optional)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 border-t border-gray-800">
      {/* Profile Display */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">
              {user.name || 'Admin User'}
            </h3>
            <p className="text-xs text-gray-400 truncate">
              {user.email}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 text-gray-400 hover:text-white transition-colors"
          title="Edit Profile"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>

      {/* Role Badge */}
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/50 text-purple-300 border border-purple-700/50">
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>
      </div>
    </div>
  )
}
