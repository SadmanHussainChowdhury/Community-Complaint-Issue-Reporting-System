'use client'

import { useState, useCallback } from 'react'
import { IUser } from '@/types'
import ResidentList from '@/components/admin/ResidentList'
import Pagination from '@/components/ui/Pagination'
import toast from 'react-hot-toast'

interface ResidentsTableProps {
  initialResidents: IUser[]
  initialTotal: number
  initialPage: number
  initialLimit: number
}

export default function ResidentsTable({
  initialResidents,
  initialTotal,
  initialPage,
  initialLimit
}: ResidentsTableProps) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit)
  const [residents, setResidents] = useState(initialResidents)
  const [totalResidents, setTotalResidents] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchResidents = useCallback(async (page: number = currentPage, limit: number = itemsPerPage, search: string = searchQuery) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (search) params.append('search', search)

      const res = await fetch(`/api/users/residents?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setResidents(data.data.residents || [])
        setTotalResidents(data.data.total || 0)
        setCurrentPage(page)
      } else {
        toast.error('Failed to fetch residents')
      }
    } catch (error) {
      console.error('Error fetching residents:', error)
      toast.error('Error loading residents')
    } finally {
      setLoading(false)
    }
  }, [currentPage, itemsPerPage, searchQuery])

  const handlePageChange = (page: number) => {
    fetchResidents(page)
  }

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize)
    setCurrentPage(1)
    fetchResidents(1, newSize)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    fetchResidents(1, itemsPerPage, query)
  }

  const handleResidentUpdate = (updatedResidents: IUser[]) => {
    setResidents(updatedResidents)
    setTotalResidents(updatedResidents.length)
    // Refresh data to get accurate totals
    fetchResidents(currentPage, itemsPerPage, searchQuery)
  }

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-slate-600">Loading residents...</span>
        </div>
      )}

      {/* Residents List */}
      <ResidentList
        residents={residents}
        onResidentsChange={handleResidentUpdate}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* Enhanced Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalResidents}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        loading={loading}
        showPageJump={totalResidents > 50}
        showPageSizeSelector={true}
        className="border-0 shadow-2xl bg-gradient-to-br from-white via-slate-50 to-white"
      />
    </div>
  )
}
