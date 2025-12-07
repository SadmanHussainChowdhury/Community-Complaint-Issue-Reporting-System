'use client'

import { useState, useCallback } from 'react'
import { IAssignment } from '@/types'
import AssignmentList from '@/components/admin/AssignmentList'
import Pagination from '@/components/ui/Pagination'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
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
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([])

  const fetchAssignments = useCallback(async (page: number = currentPage, limit: number = itemsPerPage, search: string = searchQuery, status: 'all' | 'pending' | 'in_progress' | 'completed' = statusFilter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (search) params.append('search', search)
      if (status !== 'all') params.append('status', status)

      const res = await fetch(`/api/assignments?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setAssignments(data.data.assignments || [])
        setTotalAssignments(data.data.total || 0)
        setCurrentPage(page)
        setSelectedAssignments([])
      } else {
        toast.error('Failed to fetch assignments')
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
      toast.error('Error loading assignments')
    } finally {
      setLoading(false)
    }
  }, [currentPage, itemsPerPage, searchQuery, statusFilter])

  const handlePageChange = (page: number) => {
    fetchAssignments(page)
  }

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize)
    setCurrentPage(1)
    fetchAssignments(1, newSize)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    fetchAssignments(1, itemsPerPage, query, statusFilter)
  }

  const handleFilterChange = (type: 'status', value: string) => {
    if (type === 'status') {
      setStatusFilter(value as 'all' | 'pending' | 'in_progress' | 'completed')
      fetchAssignments(1, itemsPerPage, searchQuery, value as 'all' | 'pending' | 'in_progress' | 'completed')
    }
    setCurrentPage(1)
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

  const handleBulkAction = (action: string) => {
    if (selectedAssignments.length === 0) {
      toast.error('Please select assignments first')
      return
    }

    switch (action) {
      case 'mark_completed':
        handleBulkStatusUpdate('completed')
        break
      case 'mark_in_progress':
        handleBulkStatusUpdate('in_progress')
        break
      case 'delete':
        handleBulkDelete()
        break
      default:
        toast.error('Unknown action')
    }
  }

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      const promises = selectedAssignments.map(assignmentId =>
        fetch(`/api/assignments/${assignmentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        })
      )

      await Promise.all(promises)
      toast.success(`Updated ${selectedAssignments.length} assignments`)
      fetchAssignments()
    } catch (error) {
      toast.error('Failed to update assignments')
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedAssignments.length} assignments?`)) {
      return
    }

    try {
      const promises = selectedAssignments.map(assignmentId =>
        fetch(`/api/assignments/${assignmentId}`, { method: 'DELETE' })
      )

      await Promise.all(promises)
      toast.success(`Deleted ${selectedAssignments.length} assignments`)
      fetchAssignments()
    } catch (error) {
      toast.error('Failed to delete assignments')
    }
  }

  const handleAssignmentUpdate = (updatedAssignments: IAssignment[]) => {
    setAssignments(updatedAssignments)
    fetchAssignments()
  }

  const bulkActions = [
    { label: 'Mark as Completed', value: 'mark_completed', icon: CheckCircle },
    { label: 'Mark as In Progress', value: 'mark_in_progress', icon: Clock },
    { label: 'Delete Assignments', value: 'delete', icon: AlertCircle }
  ]

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-slate-600">Loading assignments...</span>
        </div>
      )}

      {/* Assignments List */}
      <AssignmentList
        assignments={assignments}
        onAssignmentsChange={handleAssignmentUpdate}
        selectedAssignments={selectedAssignments}
        onAssignmentSelect={handleAssignmentSelection}
        onSelectAllAssignments={handleSelectAllAssignments}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Enhanced Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalAssignments}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        loading={loading}
        selectedItems={selectedAssignments}
        onBulkAction={handleBulkAction}
        bulkActions={bulkActions}
        showPageJump={totalAssignments > 50}
        showPageSizeSelector={true}
        className="border-0 shadow-2xl bg-gradient-to-br from-white via-slate-50 to-white"
      />
    </div>
  )
}
