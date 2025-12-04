'use client'

import { useState } from 'react'
import { IAnnouncement } from '@/types'
import { UserRole } from '@/types/enums'
import { Pin, Calendar, User, Trash2, Edit, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDateForDisplay } from '@/lib/utils'

interface AnnouncementListProps {
  announcements: IAnnouncement[]
  onAnnouncementsChange?: (announcements: IAnnouncement[]) => void
  onAnnouncementSelect?: (announcementId: string, selected: boolean) => void
  onSelectAllAnnouncements?: (selected: boolean) => void
  selectedAnnouncements?: string[]
  loading?: boolean
  searchQuery?: string
  onSearchChange?: (query: string) => void
  isPinnedFilter?: 'all' | 'pinned' | 'unpinned'
  targetRoleFilter?: UserRole | 'all'
  onFilterChange?: (type: 'pinned' | 'role', value: string) => void
}

const roleColors = {
  [UserRole.ADMIN]: 'bg-purple-100 text-purple-800',
  [UserRole.STAFF]: 'bg-blue-100 text-blue-800',
  [UserRole.RESIDENT]: 'bg-green-100 text-green-800',
}

export default function AnnouncementList({
  announcements: initialAnnouncements,
  onAnnouncementsChange,
  onAnnouncementSelect,
  onSelectAllAnnouncements,
  selectedAnnouncements = [],
  loading: externalLoading = false,
  searchQuery: externalSearchQuery = '',
  onSearchChange,
  isPinnedFilter: externalIsPinnedFilter = 'all',
  targetRoleFilter: externalTargetRoleFilter = 'all',
  onFilterChange
}: AnnouncementListProps) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [internalLoading, setInternalLoading] = useState(false)

  const loading = externalLoading || internalLoading

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch = !externalSearchQuery ||
      announcement.title.toLowerCase().includes(externalSearchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(externalSearchQuery.toLowerCase())
    const matchesPinned = externalIsPinnedFilter === 'all' ||
      (externalIsPinnedFilter === 'pinned' && announcement.isPinned) ||
      (externalIsPinnedFilter === 'unpinned' && !announcement.isPinned)
    const matchesRole = externalTargetRoleFilter === 'all' ||
      (announcement.targetRoles && announcement.targetRoles.includes(externalTargetRoleFilter))
    return matchesSearch && matchesPinned && matchesRole
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    setInternalLoading(true)
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.ok) {
        const updatedAnnouncements = announcements.filter(a => a._id !== id)
        setAnnouncements(updatedAnnouncements)
        onAnnouncementsChange?.(updatedAnnouncements)
        toast.success('Announcement deleted successfully!')
      } else {
        toast.error('Failed to delete announcement')
      }
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast.error('Error deleting announcement')
    } finally {
      setInternalLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={externalSearchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={externalIsPinnedFilter}
            onChange={(e) => onFilterChange?.('pinned', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Announcements</option>
            <option value="pinned">Pinned Only</option>
            <option value="unpinned">Unpinned Only</option>
          </select>
          <select
            value={externalTargetRoleFilter}
            onChange={(e) => onFilterChange?.('role', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Roles</option>
            {Object.values(UserRole).map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Announcements Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {onAnnouncementSelect && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedAnnouncements.length === filteredAnnouncements.length && filteredAnnouncements.length > 0}
                    onChange={(e) => onSelectAllAnnouncements?.(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={onAnnouncementSelect ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-3">Loading announcements...</span>
                  </div>
                </td>
              </tr>
            ) : filteredAnnouncements.length === 0 ? (
              <tr>
                <td colSpan={onAnnouncementSelect ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                  No announcements found
                </td>
              </tr>
            ) : (
              filteredAnnouncements.map((announcement) => {
                const createdBy = typeof announcement.createdBy === 'object' ? announcement.createdBy : null

                return (
                  <tr key={announcement._id} className="hover:bg-gray-50">
                    {onAnnouncementSelect && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedAnnouncements.includes(announcement._id)}
                          onChange={(e) => onAnnouncementSelect(announcement._id, e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {announcement.isPinned && (
                          <Pin className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                        )}
                        <div className="text-sm font-medium text-gray-900">{announcement.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">{announcement.content}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        {announcement.targetRoles && announcement.targetRoles.length > 0 ? (
                          announcement.targetRoles.map((role) => (
                            <span
                              key={role}
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                roleColors[role as UserRole] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">All</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {createdBy?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateForDisplay(announcement.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-primary-600 hover:text-primary-900" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(announcement._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
