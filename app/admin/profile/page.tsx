'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { User, Mail, Phone, Shield, Calendar, Edit, Save, X, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { Loader } from '@/components/ui'
import toast from 'react-hot-toast'
import { SessionUser, IUser } from '@/types'

export default function AdminProfilePage() {
  const { data: session, update } = useSession()
  const user = session?.user as SessionUser | undefined

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userData, setUserData] = useState<IUser | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Fetch full user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setFetching(false)
        return
      }

      try {
        setFetching(true)
        const response = await fetch(`/api/users/${user.id}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data?.user) {
            const fullUser = result.data.user
            setUserData(fullUser)
            setFormData({
              name: fullUser.name || '',
              email: fullUser.email || '',
              phone: fullUser.phone || '',
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            })
          }
        } else {
          toast.error('Failed to load profile data')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast.error('Error loading profile')
      } finally {
        setFetching(false)
      }
    }

    fetchUserData()
  }, [user?.id])

  const handleInputChange = (field: string, value: string) => {
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address'
    }

    // Password change is optional - only validate if user is trying to change it
    const isChangingPassword = formData.newPassword || formData.confirmPassword || formData.currentPassword
    
    if (isChangingPassword) {
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
      const userId = user?.id || userData?._id
      if (!userId) {
        toast.error('User ID not found')
        setLoading(false)
        return
      }

      const updateData: Record<string, string> = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      }

      if (formData.phone) {
        updateData.phone = formData.phone.trim()
      }

      if (formData.newPassword) {
        updateData.password = formData.newPassword
        updateData.currentPassword = formData.currentPassword
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Profile updated successfully!', {
          icon: '✅',
          duration: 3000,
        })
        
        // Update local user data
        if (result.data?.user) {
          setUserData(result.data.user)
        }
        
        setIsEditing(false)
        
        // Reset password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }))

        // Update session to reflect changes
        await update({
          ...session,
          user: {
            ...session?.user,
            name: formData.name.trim(),
            email: formData.email.trim(),
          },
        })
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
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    }
    setIsEditing(false)
  }

  if (fetching || !user || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader size="md" variant="primary" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  const profileData = [
    { label: 'Name', value: isEditing ? formData.name : userData.name || 'N/A', icon: User, editable: true, field: 'name' },
    { label: 'Email', value: isEditing ? formData.email : userData.email || 'N/A', icon: Mail, editable: true, field: 'email' },
    { label: 'Phone', value: isEditing ? formData.phone : userData.phone || 'N/A', icon: Phone, editable: true, field: 'phone' },
    { label: 'Role', value: userData.role?.charAt(0).toUpperCase() + userData.role?.slice(1) || 'Admin', icon: Shield, editable: false },
    { label: 'User ID', value: userData._id || 'N/A', icon: User, editable: false },
    { label: 'Account Status', value: userData.isActive !== false ? 'Active' : 'Inactive', icon: Calendar, editable: false },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="mt-2 text-gray-600">Manage your admin profile information</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Edit className="w-5 h-5" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader size="sm" variant="white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Table */}
      <div className="bg-white rounded-lg shadow-md">
        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
        </div>

        {/* Profile Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {profileData.map((item, index) => {
                const Icon = item.icon
                const fieldName = item.field
                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Icon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isEditing && item.editable && fieldName ? (
                        <div className="max-w-md">
                          {fieldName === 'phone' ? (
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter phone number"
                            />
                          ) : (
                            <input
                              type={fieldName === 'email' ? 'email' : 'text'}
                              value={formData[fieldName as keyof typeof formData] as string}
                              onChange={(e) => handleInputChange(fieldName, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder={`Enter ${item.label.toLowerCase()}`}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-900 font-medium">{item.value}</div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {profileData.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 text-sm text-gray-500">
            Showing {profileData.length} profile fields
          </div>
        )}

        {/* Password Change Section */}
        {isEditing && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-indigo-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-medium">Optional:</span> Leave password fields empty if you don&apos;t want to change your password.
            </p>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password <span className="text-gray-500 text-xs">(required if changing password)</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password <span className="text-gray-500 text-xs">(required if changing password)</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter new password (min. 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Minimum 6 characters required</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password <span className="text-gray-500 text-xs">(required if changing password)</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                )}
                {formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                  <p className="mt-1 text-xs text-green-600 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Passwords match
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

