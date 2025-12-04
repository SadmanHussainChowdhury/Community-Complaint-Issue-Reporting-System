'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IUser } from '@/types'
import { formatDateForDisplay } from '@/lib/utils'
import { UserRole } from '@/types/enums'
import { ArrowLeft, Edit, Trash2, Mail, Phone, Building, User, Shield, UserCheck, Calendar, CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface UserDetailViewProps {
  user: IUser
}

const roleIcons = {
  [UserRole.ADMIN]: Shield,
  [UserRole.STAFF]: UserCheck,
  [UserRole.RESIDENT]: User,
}

const roleColors = {
  [UserRole.ADMIN]: 'bg-purple-100 text-purple-800',
  [UserRole.STAFF]: 'bg-blue-100 text-blue-800',
  [UserRole.RESIDENT]: 'bg-green-100 text-green-800',
}

export default function UserDetailView({ user: initialUser }: UserDetailViewProps) {
  const router = useRouter()
  const [user, setUser] = useState(initialUser)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.ok) {
        toast.success('User deleted successfully')
        router.push('/admin/users')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('An error occurred while deleting the user')
    } finally {
      setDeleting(false)
    }
  }

  const RoleIcon = roleIcons[user.role as UserRole] || User

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/admin/users"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
            <p className="mt-2 text-gray-600">View and manage user information</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href={`/admin/users/${user._id}/edit`}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Edit className="w-5 h-5" />
              <span>Edit User</span>
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`h-20 w-20 rounded-full flex items-center justify-center ${roleColors[user.role as UserRole] || 'bg-gray-100 text-gray-800'}`}>
                <RoleIcon className="w-10 h-10" />
              </div>
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <p className="text-indigo-100 mt-1">{user.email}</p>
              <div className="mt-2 flex items-center space-x-3">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${roleColors[user.role as UserRole] || 'bg-gray-100 text-gray-800'}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <dl className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{user.email}</dd>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="text-sm text-gray-900">{user.phone || 'N/A'}</dd>
                  </div>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h3>
              <dl className="space-y-3">
                <div className="flex items-center">
                  <Building className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Building</dt>
                    <dd className="text-sm text-gray-900">{user.building || 'N/A'}</dd>
                  </div>
                </div>
                <div className="flex items-center">
                  <Building className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Apartment</dt>
                    <dd className="text-sm text-gray-900">{user.apartment || 'N/A'}</dd>
                  </div>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <dl className="space-y-3">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">User ID</dt>
                    <dd className="text-sm text-gray-900 font-mono">{user._id}</dd>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created At</dt>
                    <dd className="text-sm text-gray-900">
                      {formatDateForDisplay(user.createdAt)}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="text-sm text-gray-900">
                      {formatDateForDisplay(user.updatedAt)}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

