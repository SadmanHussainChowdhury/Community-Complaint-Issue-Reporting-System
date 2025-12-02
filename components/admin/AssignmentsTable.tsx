'use client'

import { useState, useCallback, useEffect } from 'react'
import { IAssignment } from '@/types'
import { UserRole } from '@/types/enums'
import AssignmentList from '@/components/admin/AssignmentList'
import Pagination from '@/components/ui/Pagination'
import { Search, Filter, Download, CheckCircle, Clock, AlertCircle, User } from 'lucide-react'
import toast from 'react-hot-toast'

interface AssignmentsTableProps {
  initialAssignments: IAssignment[]
  initialTotal: number
  initialPage: number
  initialLimit: number
}

export default function AssignmentsTable({
  initialAssignments,
  initialTotal,
  initialPage,
  initialLimit
}: AssignmentsTableProps) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit)
  const [assignments, setAssignments] = useState(initialAssignments)
  const [totalAssignments, setTotalAssignments] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')
  const [assignedToFilter, setAssignedToFilter] = useState<string>('all')
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const fetchAssignments = useCallback(async (page: number = currentPage, limit: number = itemsPerPage, search: string = searchQuery, status: 'all' | 'pending' | 'in_progress' | 'completed' = statusFilter, assignedTo: string = assignedToFilter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (search) params.append('search', search)
      if (status !== 'all') params.append('status', status)
      if (assignedTo !== 'all') params.append('assignedTo', assignedTo)

      const res = await fetch(`/api/assignments?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setAssignments(data.data.assignments || [])
        setTotalAssignments(data.data.total || 0)
        setCurrentPage(page)
        setSelectedAssignments([]) // Clear selections on new data
      } else {
        toast.error('Failed to fetch assignments')
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
      toast.error('Error loading assignments')
    } finally {
      setLoading(false)
    }
  }, [currentPage, itemsPerPage, searchQuery, statusFilter, assignedToFilter])

  const handlePageChange = (page: number) => {
    fetchAssignments(page)
  }

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize)
    setCurrentPage(1) // Reset to first page when changing page size
    fetchAssignments(1, newSize)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
    fetchAssignments(1, itemsPerPage, query, statusFilter, assignedToFilter)
  }

  const handleFilterChange = (type: 'status' | 'assignedTo', value: string) => {
    if (type === 'status') {
      setStatusFilter(value as 'all' | 'pending' | 'in_progress' | 'completed')
      fetchAssignments(1, itemsPerPage, searchQuery, value as 'all' | 'pending' | 'in_progress' | 'completed', assignedToFilter)
    } else if (type === 'assignedTo') {
      setAssignedToFilter(value)
      fetchAssignments(1, itemsPerPage, searchQuery, statusFilter, value)
    }
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleAssignmentsChange = (updatedAssignments: IAssignment[]) => {
    setAssignments(updatedAssignments)
    // Refresh data to get updated totals
    fetchAssignments()
  }

  // Bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedAssignments.length === 0) {
      toast.error('Please select assignments first')
      return
    }

    switch (action) {
      case 'mark_pending':
        handleBulkStatusUpdate('pending')
        break
      case 'mark_in_progress':
        handleBulkStatusUpdate('in_progress')
        break
      case 'mark_completed':
        handleBulkStatusUpdate('completed')
        break
      case 'delete':
        handleBulkDelete()
        break
      default:
        toast.error('Unknown action')
    }
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      const promises = selectedAssignments.map(assignmentId =>
        fetch(`/api/assignments/${assignmentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        })
      )

      await Promise.all(promises)
      toast.success(`${selectedAssignments.length} assignments updated to ${newStatus}`)
      fetchAssignments() // Refresh data
    } catch (error) {
      toast.error('Failed to update assignments')
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedAssignments.length} assignments? This action cannot be undone.`)) {
      return
    }

    try {
      const promises = selectedAssignments.map(assignmentId =>
        fetch(`/api/assignments/${assignmentId}`, { method: 'DELETE' })
      )

      await Promise.all(promises)
      toast.success(`Deleted ${selectedAssignments.length} assignments`)
      fetchAssignments() // Refresh data
    } catch (error) {
      toast.error('Failed to delete assignments')
    }
  }

  const handleAssignmentSelection = (assignmentId: string, selected: boolean) => {
    setSelectedAssignments(prev =>
      selected
        ? [...prev, assignmentId]
        : prev.filter(id => id !== assignmentId)
    )
  }

  const handleSelectAllAssignments = (selected: boolean) => {
    if (selected) {
      setSelectedAssignments(assignments.map(a => a._id))
    } else {
      setSelectedAssignments([])
    }
  }

  const bulkActions = [
    { label: 'Mark as Pending', value: 'mark_pending', icon: Clock },
    { label: 'Mark as In Progress', value: 'mark_in_progress', icon: AlertCircle },
    { label: 'Mark as Completed', value: 'mark_completed', icon: CheckCircle },
    { label: 'Delete Assignments', value: 'delete', icon: User }
  ]

  const handleExport = () => {
    // Create CSV export of current filtered results
    const csvContent = [
      ['Title', 'Status', 'Assigned To', 'Assigned By', 'Assigned Date', 'Priority'].join(','),
      ...assignments.map(assignment => [
        `"${assignment.complaint && typeof assignment.complaint === 'object' ? assignment.complaint.title : 'Unknown'}"`,
        assignment.status,
        `"${assignment.assignedTo && typeof assignment.assignedTo === 'object' ? assignment.assignedTo.name : 'Unknown'}"`,
        `"${assignment.assignedBy && typeof assignment.assignedBy === 'object' ? assignment.assignedBy.name : 'Unknown'}"`,
        new Date(assignment.assignedAt).toLocaleDateString(),
        assignment.complaint && typeof assignment.complaint === 'object' ? assignment.complaint.priority : 'Unknown'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `assignments-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Assignments exported successfully')
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header with Search and Filters */}
      <div className="p-8 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              Assignments Management
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            {selectedAssignments.length > 0 && (
              <div className="text-sm text-primary-600 font-medium">
                {selectedAssignments.length} selected
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
                placeholder="Search assignments by title, staff, or status..."
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
                  value={statusFilter}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                <select
                  value={assignedToFilter}
                  onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Staff</option>
                  {/* This would be populated with actual staff members */}
                  <option value="staff1">Staff Member 1</option>
                  <option value="staff2">Staff Member 2</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <AssignmentList
        assignments={assignments}
        onAssignmentsChange={handleAssignmentsChange}
        onAssignmentSelect={handleAssignmentSelection}
        onSelectAllAssignments={handleSelectAllAssignments}
        selectedAssignments={selectedAssignments}
        loading={loading}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={totalAssignments}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={handleSearchChange}
        searchQuery={searchQuery}
        loading={loading}
        bulkActions={bulkActions}
        selectedItems={selectedAssignments}
        onBulkAction={handleBulkAction}
        onExport={handleExport}
        showPageJump={totalAssignments > itemsPerPage * 5}
        showPageSizeSelector={true}
        className="border-0 shadow-2xl bg-gradient-to-br from-white via-slate-50 to-white"
      />
    </div>
  )
}
