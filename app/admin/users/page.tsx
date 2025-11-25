'use client'

import { useState, useEffect } from 'react'
import UserList from '@/components/admin/UserList'
import { IUser } from '@/types'
import Link from 'next/link'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<IUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/users', {
          credentials: 'include'
        })

        if (!res.ok) {
          if (res.status === 401) {
            setError('Authentication required. Please sign in again.')
            return
          }
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        const contentType = res.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned invalid response format')
        }

        const data = await res.json()

        if (data.success) {
          setUsers(data.data.users || [])
        } else {
          setError(data.error || 'Failed to load users')
        }
      } catch (err) {
        setError('Failed to load users')
        console.error('Error fetching users:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">Manage residents, staff, and administrators</p>
        </div>
        <Link
          href="/admin/users/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 inline-flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add User</span>
        </Link>
      </div>

      <UserList users={users} />
    </div>
  )
}

