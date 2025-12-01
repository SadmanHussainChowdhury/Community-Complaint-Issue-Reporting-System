'use client'

import { useState } from 'react'
import { IAnnouncement } from '@/types'
import AnnouncementList from '@/components/admin/AnnouncementList'
import Pagination from '@/components/ui/Pagination'

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
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [loading, setLoading] = useState(false)

  const fetchAnnouncements = async (page: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/announcements?page=${page}&limit=${initialLimit}`)
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.data.announcements || [])
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    fetchAnnouncements(page)
  }

  const handleAnnouncementsChange = (updatedAnnouncements: IAnnouncement[]) => {
    setAnnouncements(updatedAnnouncements)
  }

  return (
    <div className="space-y-6">
      <AnnouncementList announcements={announcements} onAnnouncementsChange={handleAnnouncementsChange} />

      <Pagination
        currentPage={currentPage}
        totalItems={initialTotal}
        itemsPerPage={initialLimit}
        onPageChange={handlePageChange}
        className="bg-white rounded-lg shadow-md"
      />
    </div>
  )
}
