'use client'

import { useState, useCallback } from 'react'
import { IAnnouncement } from '@/types'
import { UserRole } from '@/types/enums'
import AnnouncementList from '@/components/admin/AnnouncementList'
import Pagination from '@/components/ui/Pagination'
import { Pin, PinOff, Trash2 } from 'lucide-react'
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
        setSelectedAnnouncements([])
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
    setCurrentPage(1)
    fetchAnnouncements(1, newSize)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    fetchAnnouncements(1, itemsPerPage, query, isPinnedFilter, targetRoleFilter)
  }

  const handleFilterChange = (type: 'pinned' | 'role', value: string) => {
    if (type === 'pinned') {
      setIsPinnedFilter(value as 'all' | 'pinned' | 'unpinned')
      fetchAnnouncements(1, itemsPerPage, searchQuery, value as 'all' | 'pinned' | 'unpinned', targetRoleFilter)
    } else if (type === 'role') {
      setTargetRoleFilter(value as UserRole | 'all')
      fetchAnnouncements(1, itemsPerPage, searchQuery, isPinnedFilter, value as UserRole | 'all')
    }
    setCurrentPage(1)
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
      toast.success(`${pin ? 'Pinned' : 'Unpinned'} ${selectedAnnouncements.length} announcements`)
      fetchAnnouncements()
    } catch (error) {
      toast.error('Failed to update announcements')
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedAnnouncements.length} announcements?`)) {
      return
    }

    try {
      const promises = selectedAnnouncements.map(announcementId =>
        fetch(`/api/announcements/${announcementId}`, { method: 'DELETE' })
      )

      await Promise.all(promises)
      toast.success(`Deleted ${selectedAnnouncements.length} announcements`)
      fetchAnnouncements()
    } catch (error) {
      toast.error('Failed to delete announcements')
    }
  }

  const handleAnnouncementUpdate = (updatedAnnouncements: IAnnouncement[]) => {
    setAnnouncements(updatedAnnouncements)
    fetchAnnouncements()
  }

  const bulkActions = [
    { label: 'Pin Announcements', value: 'pin', icon: Pin },
    { label: 'Unpin Announcements', value: 'unpin', icon: PinOff },
    { label: 'Delete Announcements', value: 'delete', icon: Trash2 }
  ]

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-slate-600">Loading announcements...</span>
        </div>
      )}

      {/* Announcements List */}
      <AnnouncementList
        announcements={announcements}
        onAnnouncementsChange={handleAnnouncementUpdate}
        selectedAnnouncements={selectedAnnouncements}
        onAnnouncementSelect={handleAnnouncementSelection}
        onSelectAllAnnouncements={handleSelectAllAnnouncements}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        isPinnedFilter={isPinnedFilter}
        targetRoleFilter={targetRoleFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Enhanced Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalAnnouncements}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        loading={loading}
        selectedItems={selectedAnnouncements}
        onBulkAction={handleBulkAction}
        bulkActions={bulkActions}
        showPageJump={totalAnnouncements > 50}
        showPageSizeSelector={true}
        className="border-0 shadow-2xl bg-gradient-to-br from-white via-slate-50 to-white"
      />
    </div>
  )
}
