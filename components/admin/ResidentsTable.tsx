'use client'

import { useState, useCallback } from 'react'
import { IUser } from '@/types'
import ResidentList from '@/components/admin/ResidentList'
import Pagination from '@/components/ui/Pagination'
import { Search, Filter, Download, UserPlus } from 'lucide-react'
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
  const [showFilters, setShowFilters] = useState(false)

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
    setCurrentPage(1) // Reset to first page when changing page size
    fetchResidents(1, newSize)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
    fetchResidents(1, itemsPerPage, query)
  }

  const handleResidentUpdate = (updatedResidents: IUser[]) => {
    setResidents(updatedResidents)
    // Refresh data to get updated totals
    fetchResidents()
  }

  const handleExport = () => {
    // Create CSV export of current filtered results
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Apartment', 'Building', 'Status', 'Joined Date'].join(','),
      ...residents.map(resident => [
        `"${resident.name}"`,
        `"${resident.email}"`,
        resident.phone || '',
        resident.apartment || '',
        resident.building || '',
        resident.isActive ? 'Active' : 'Inactive',
        new Date(resident.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `residents-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Residents exported successfully')
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header with Search and Filters */}
      <div className="p-8 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              Community Residents
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-primary-600 font-medium">
              {totalResidents} total residents
            </div>
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
                placeholder="Search residents by name or email..."
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value="active"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">Active Residents</option>
                  <option value="inactive">Inactive Residents</option>
                  <option value="all">All Residents</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Building</label>
                <select
                  value="all"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Buildings</option>
                  <option value="A">Building A</option>
                  <option value="B">Building B</option>
                  <option value="C">Building C</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <ResidentList
        residents={residents}
        onResidentsChange={handleResidentUpdate}
        loading={loading}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={totalResidents}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={handleSearchChange}
        searchQuery={searchQuery}
        loading={loading}
        onExport={handleExport}
        showPageJump={totalResidents > itemsPerPage * 5}
        showPageSizeSelector={true}
        className="border-0 shadow-2xl bg-gradient-to-br from-white via-slate-50 to-white"
      />
    </div>
  )
}

import { useState, useCallback } from 'react'
import { IUser } from '@/types'
import UserList from '@/components/admin/UserList'
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
        role: 'resident'
      })

      if (search) params.append('search', search)

      const res = await fetch(`/api/users?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setResidents(data.data.users || [])
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
    setCurrentPage(1) // Reset to first page when changing page size
    fetchResidents(1, newSize)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
    fetchResidents(1, itemsPerPage, query)
  }

  const handleResidentsChange = (updatedResidents: IUser[]) => {
    setResidents(updatedResidents)
    // Refresh data to get updated totals
    fetchResidents()
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header with Search */}
      <div className="p-8 border-b border-gray-200">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400">
                🔍
              </div>
              <input
                type="text"
                placeholder="Search residents by name or email..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <UserList
        users={residents}
        onUsersChange={handleResidentsChange}
        loading={loading}
        showRoleFilter={false}
        defaultRoleFilter="resident"
      />

      <Pagination
        currentPage={currentPage}
        totalItems={totalResidents}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={handleSearchChange}
        searchQuery={searchQuery}
        loading={loading}
        showPageJump={totalResidents > itemsPerPage * 5}
        showPageSizeSelector={true}
        className="border-0 shadow-2xl bg-gradient-to-br from-white via-slate-50 to-white"
      />
    </div>
  )
}
