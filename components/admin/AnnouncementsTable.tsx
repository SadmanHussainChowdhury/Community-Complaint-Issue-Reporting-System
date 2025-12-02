'use client'

import { useState, useCallback, useEffect } from 'react'
import { IAnnouncement } from '@/types'
import { UserRole } from '@/types/enums'
import AnnouncementList from '@/components/admin/AnnouncementList'
import Pagination from '@/components/ui/Pagination'
import { Search, Filter, Download, Pin, PinOff, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface AnnouncementsTableProps {
  initialAnnouncements: IAnnouncement[]
  initialTotal: number
  initialPage: number
  initialLimit: number
}

export default function AnnouncementsTable({
  initialAnnouncements,
  initialTotal,
  initialPage,
  initialLimit
}: AnnouncementsTableProps) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit)
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [totalAnnouncements, setTotalAnnouncements] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isPinnedFilter, setIsPinnedFilter] = useState<'all' | 'pinned' | 'unpinned'>('all')
  const [targetRoleFilter, setTargetRoleFilter] = useState<UserRole | 'all'>('all')
  const [selectedAnnouncements, setSelectedAnnouncements] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const fetchAnnouncements = useCallback(async (page: number = currentPage, limit: number = itemsPerPage, search: string = searchQuery, isPinned: 'all' | 'pinned' | 'unpinned' = isPinnedFilter, targetRole: UserRole | 'all' = targetRoleFilter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (search) params.append('search', search)
      if (isPinned !== 'all') params.append('isPinned', isPinned === 'pinned' ? 'true' : 'false')
      if (targetRole !== 'all') params.append('targetRole', targetRole)

      const res = await fetch(`/api/announcements?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.data.announcements || [])
        setTotalAnnouncements(data.data.total || 0)
        setCurrentPage(page)
        setSelectedAnnouncements([]) // Clear selections on new data
      } else {
        toast.error('Failed to fetch announcements')
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
      toast.error('Error loading announcements')
    } finally {
      setLoading(false)
    }
  }, [currentPage, itemsPerPage, searchQuery, isPinnedFilter, targetRoleFilter])

  const handlePageChange = (page: number) => {
    fetchAnnouncements(page)
  }

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize)
    setCurrentPage(1) // Reset to first page when changing page size
    fetchAnnouncements(1, newSize)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
    fetchAnnouncements(1, itemsPerPage, query, isPinnedFilter, targetRoleFilter)
  }

  const handleFilterChange = (type: 'pinned' | 'targetRole', value: string) => {
    if (type === 'pinned') {
      setIsPinnedFilter(value as 'all' | 'pinned' | 'unpinned')
      fetchAnnouncements(1, itemsPerPage, searchQuery, value as 'all' | 'pinned' | 'unpinned', targetRoleFilter)
    } else if (type === 'targetRole') {
      setTargetRoleFilter(value as UserRole | 'all')
      fetchAnnouncements(1, itemsPerPage, searchQuery, isPinnedFilter, value as UserRole | 'all')
    }
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleAnnouncementsChange = (updatedAnnouncements: IAnnouncement[]) => {
    setAnnouncements(updatedAnnouncements)
    // Refresh data to get updated totals
    fetchAnnouncements()
  }

  // Bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedAnnouncements.length === 0) {
      toast.error('Please select announcements first')
      return
    }

    switch (action) {
      case 'pin':
        handleBulkPin(true)
        break
      case 'unpin':
        handleBulkPin(false)
        break
      case 'delete':
        handleBulkDelete()
        break
      case 'archive':
        handleBulkArchive()
        break
      default:
        toast.error('Unknown action')
    }
  }

  const handleBulkPin = async (pin: boolean) => {
    try {
      const promises = selectedAnnouncements.map(announcementId =>
        fetch(`/api/announcements/${announcementId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPinned: pin })
        })
      )

      await Promise.all(promises)
      toast.success(`${selectedAnnouncements.length} announcements ${pin ? 'pinned' : 'unpinned'}`)
      fetchAnnouncements() // Refresh data
    } catch (error) {
      toast.error('Failed to update announcements')
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedAnnouncements.length} announcements? This action cannot be undone.`)) {
      return
    }

    try {
      const promises = selectedAnnouncements.map(announcementId =>
        fetch(`/api/announcements/${announcementId}`, { method: 'DELETE' })
      )

      await Promise.all(promises)
      toast.success(`Deleted ${selectedAnnouncements.length} announcements`)
      fetchAnnouncements() // Refresh data
    } catch (error) {
      toast.error('Failed to delete announcements')
    }
  }

  const handleBulkArchive = async () => {
    try {
      const promises = selectedAnnouncements.map(announcementId =>
        fetch(`/api/announcements/${announcementId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expiresAt: new Date() })
        })
      )

      await Promise.all(promises)
      toast.success(`${selectedAnnouncements.length} announcements archived`)
      fetchAnnouncements() // Refresh data
    } catch (error) {
      toast.error('Failed to archive announcements')
    }
  }

  const handleAnnouncementSelection = (announcementId: string, selected: boolean) => {
    setSelectedAnnouncements(prev =>
      selected
        ? [...prev, announcementId]
        : prev.filter(id => id !== announcementId)
    )
  }

  const handleSelectAllAnnouncements = (selected: boolean) => {
    if (selected) {
      setSelectedAnnouncements(announcements.map(a => a._id))
    } else {
      setSelectedAnnouncements([])
    }
  }

  const bulkActions = [
    { label: 'Pin Selected', value: 'pin', icon: Pin },
    { label: 'Unpin Selected', value: 'unpin', icon: PinOff },
    { label: 'Archive Selected', value: 'archive', icon: Eye },
    { label: 'Delete Selected', value: 'delete', icon: Trash2 }
  ]

  const handleExport = () => {
    // Create CSV export of current filtered results
    const csvContent = [
      ['Title', 'Content', 'Pinned', 'Target Roles', 'Created By', 'Created', 'Expires', 'Views'].join(','),
      ...announcements.map(announcement => [
        `"${announcement.title}"`,
        `"${announcement.content.replace(/"/g, '""')}"`,
        announcement.isPinned ? 'Yes' : 'No',
        (announcement.targetRoles || []).join('; '),
        `"${announcement.createdBy && typeof announcement.createdBy === 'object' ? announcement.createdBy.name : 'Unknown'}"`,
        new Date(announcement.createdAt).toLocaleDateString(),
        announcement.expiresAt ? new Date(announcement.expiresAt).toLocaleDateString() : 'Never',
        0
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `announcements-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Announcements exported successfully')
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header with Search and Filters */}
      <div className="p-8 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              Announcements Management
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            {selectedAnnouncements.length > 0 && (
              <div className="text-sm text-primary-600 font-medium">
                {selectedAnnouncements.length} selected
              </div>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search announcements by title or content..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pin Status</label>
                <select
                  value={isPinnedFilter}
                  onChange={(e) => handleFilterChange('pinned', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Announcements</option>
                  <option value="pinned">Pinned Only</option>
                  <option value="unpinned">Unpinned Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Role</label>
                <select
                  value={targetRoleFilter}
                  onChange={(e) => handleFilterChange('targetRole', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="resident">Resident</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnnouncementList
        announcements={announcements}
        onAnnouncementsChange={handleAnnouncementsChange}
        onAnnouncementSelect={handleAnnouncementSelection}
        onSelectAllAnnouncements={handleSelectAllAnnouncements}
        selectedAnnouncements={selectedAnnouncements}
        loading={loading}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={totalAnnouncements}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={handleSearchChange}
        searchQuery={searchQuery}
        loading={loading}
        bulkActions={bulkActions}
        selectedItems={selectedAnnouncements}
        onBulkAction={handleBulkAction}
        onExport={handleExport}
        showPageJump={totalAnnouncements > itemsPerPage * 5}
        showPageSizeSelector={true}
        className="border-0 shadow-2xl bg-gradient-to-br from-white via-slate-50 to-white"
      />
    </div>
  )
}
