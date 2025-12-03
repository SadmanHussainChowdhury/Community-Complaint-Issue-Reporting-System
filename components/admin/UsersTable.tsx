'use client'

import { useState, useCallback } from 'react'
import { IUser } from '@/types'
import { UserRole } from '@/types/enums'
import UserList from '@/components/admin/UserList'
import Pagination from '@/components/ui/Pagination'
import { Filter, Download, UserCheck, UserX, Users, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface UsersTableProps {
  initialUsers: IUser[]
  initialTotal: number
  initialPage: number
  initialLimit: number
}

export default function UsersTable({
  initialUsers,
  initialTotal,
  initialPage,
  initialLimit
}: UsersTableProps) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit)
  const [users, setUsers] = useState(initialUsers)
  const [totalUsers, setTotalUsers] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const fetchUsers = useCallback(async (page: number = currentPage, limit: number = itemsPerPage, search: string = searchQuery, role: UserRole | 'all' = roleFilter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (search) params.append('search', search)
      if (role !== 'all') params.append('role', role)

      const res = await fetch(`/api/users?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.data.users || [])
        setTotalUsers(data.data.total || 0)
        setCurrentPage(page)
        setSelectedUsers([]) // Clear selections on new data
      } else {
        toast.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error loading users')
    } finally {
      setLoading(false)
    }
  }, [currentPage, itemsPerPage, searchQuery, roleFilter])

  const handlePageChange = (page: number) => {
    fetchUsers(page)
  }

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize)
    setCurrentPage(1) // Reset to first page when changing page size
    fetchUsers(1, newSize)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
    fetchUsers(1, itemsPerPage, query, roleFilter)
  }

  const handleRoleFilter = (role: UserRole | 'all') => {
    setRoleFilter(role)
    setCurrentPage(1) // Reset to first page when filtering
    fetchUsers(1, itemsPerPage, searchQuery, role)
  }

  // Bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first')
      return
    }

    switch (action) {
      case 'activate':
        handleBulkActivate()
        break
      case 'deactivate':
        handleBulkDeactivate()
        break
      case 'delete':
        handleBulkDelete()
        break
      default:
        toast.error('Unknown action')
    }
  }

  const handleBulkActivate = async () => {
    try {
      const promises = selectedUsers.map(userId =>
        fetch(`/api/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: true })
        })
      )

      await Promise.all(promises)
      toast.success(`Activated ${selectedUsers.length} users`)
      fetchUsers() // Refresh data
    } catch (error) {
      toast.error('Failed to activate users')
    }
  }

  const handleBulkDeactivate = async () => {
    try {
      const promises = selectedUsers.map(userId =>
        fetch(`/api/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: false })
        })
      )

      await Promise.all(promises)
      toast.success(`Deactivated ${selectedUsers.length} users`)
      fetchUsers() // Refresh data
    } catch (error) {
      toast.error('Failed to deactivate users')
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
      return
    }

    try {
      const promises = selectedUsers.map(userId =>
        fetch(`/api/users/${userId}`, { method: 'DELETE' })
      )

      await Promise.all(promises)
      toast.success(`Deleted ${selectedUsers.length} users`)
      fetchUsers() // Refresh data
    } catch (error) {
      toast.error('Failed to delete users')
    }
  }

  const handleExport = () => {
    // Create CSV export of current filtered results
    const csvContent = [
      ['Name', 'Email', 'Role', 'Phone', 'Apartment', 'Building', 'Status', 'Created'].join(','),
      ...users.map(user => [
        `"${user.name}"`,
        `"${user.email}"`,
        user.role,
        `"${user.phone || ''}"`,
        `"${user.apartment || ''}"`,
        `"${user.building || ''}"`,
        user.isActive ? 'Active' : 'Inactive',
        new Date(user.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Users exported successfully')
  }

  const handleUserUpdate = (updatedUsers: IUser[]) => {
    setUsers(updatedUsers)
    // Refresh data to get updated totals
    fetchUsers()
  }

  const handleUserSelection = (userId: string, selected: boolean) => {
    setSelectedUsers(prev =>
      selected
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    )
  }

  const bulkActions = [
    { label: 'Activate Users', value: 'activate', icon: UserCheck },
    { label: 'Deactivate Users', value: 'deactivate', icon: UserX },
    { label: 'Delete Users', value: 'delete', icon: Users }
  ]

  return (
    <div className="space-y-6">
      {/* Filters and Export */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            {showFilters ? '▲' : '▼'}
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => handleRoleFilter(e.target.value as UserRole | 'all')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="all">All Roles</option>
                  <option value="resident">Resident</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="ml-3 text-slate-600">Loading users...</span>
        </div>
      )}

      {/* Users List */}
      <UserList
        users={users}
        onUsersChange={handleUserUpdate}
        selectedUsers={selectedUsers}
        onUserSelect={handleUserSelection}
        loading={loading}
      />

      {/* Enhanced Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalUsers}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        loading={loading}
        selectedItems={selectedUsers}
        onBulkAction={handleBulkAction}
        bulkActions={bulkActions}
        showPageJump={totalUsers > 50}
        showPageSizeSelector={true}
        className="border-0 shadow-2xl bg-gradient-to-br from-white via-slate-50 to-white"
      />
    </div>
  )
}
