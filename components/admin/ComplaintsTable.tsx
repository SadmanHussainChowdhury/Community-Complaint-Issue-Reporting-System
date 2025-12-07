'use client'

import { useState, useCallback } from 'react'
import { IComplaint, IUser } from '@/types'
import { ComplaintStatus, ComplaintPriority, ComplaintCategory } from '@/types/enums'
import ComplaintList from '@/components/admin/ComplaintList'
import Pagination from '@/components/ui/Pagination'
import { UserCheck, UserX, Users, Clock, AlertCircle, CheckCircle, ClipboardList } from 'lucide-react'
import toast from 'react-hot-toast'

interface ComplaintsTableProps {
  initialComplaints: IComplaint[]
  initialStaff: IUser[]
  initialTotal: number
  initialPage: number
  initialLimit: number
}

export default function ComplaintsTable({
  initialComplaints,
  initialStaff,
  initialTotal,
  initialPage,
  initialLimit
}: ComplaintsTableProps) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit)
  const [complaints, setComplaints] = useState(initialComplaints)
  const [totalComplaints, setTotalComplaints] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<ComplaintPriority | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'all'>('all')
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([])

  const fetchComplaints = useCallback(async (page: number = currentPage, limit: number = itemsPerPage, search: string = searchQuery, status: ComplaintStatus | 'all' = statusFilter, priority: ComplaintPriority | 'all' = priorityFilter, category: ComplaintCategory | 'all' = categoryFilter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (search) params.append('search', search)
      if (status !== 'all') params.append('status', status)
      if (priority !== 'all') params.append('priority', priority)
      if (category !== 'all') params.append('category', category)

      const res = await fetch(`/api/complaints?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setComplaints(data.data.complaints || [])
        setTotalComplaints(data.data.total || 0)
        setCurrentPage(page)
        setSelectedComplaints([])
      } else {
        toast.error('Failed to fetch complaints')
      }
    } catch (error) {
      console.error('Error fetching complaints:', error)
      toast.error('Error loading complaints')
    } finally {
      setLoading(false)
    }
  }, [currentPage, itemsPerPage, searchQuery, statusFilter, priorityFilter, categoryFilter])

  const handlePageChange = (page: number) => {
    fetchComplaints(page)
  }

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize)
    setCurrentPage(1)
    fetchComplaints(1, newSize)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    fetchComplaints(1, itemsPerPage, query, statusFilter, priorityFilter, categoryFilter)
  }

  const handleFilterChange = (type: 'status' | 'priority' | 'category', value: string) => {
    if (type === 'status') {
      setStatusFilter(value as ComplaintStatus | 'all')
      fetchComplaints(1, itemsPerPage, searchQuery, value as ComplaintStatus | 'all', priorityFilter, categoryFilter)
    } else if (type === 'priority') {
      setPriorityFilter(value as ComplaintPriority | 'all')
      fetchComplaints(1, itemsPerPage, searchQuery, statusFilter, value as ComplaintPriority | 'all', categoryFilter)
    } else if (type === 'category') {
      setCategoryFilter(value as ComplaintCategory | 'all')
      fetchComplaints(1, itemsPerPage, searchQuery, statusFilter, priorityFilter, value as ComplaintCategory | 'all')
    }
    setCurrentPage(1)
  }

  const handleComplaintSelection = (complaintId: string, selected: boolean) => {
    setSelectedComplaints(prev =>
      selected
        ? [...prev, complaintId]
        : prev.filter(id => id !== complaintId)
    )
  }

  const handleSelectAllComplaints = (selected: boolean) => {
    if (selected) {
      setSelectedComplaints(complaints.map(c => c._id))
    } else {
      setSelectedComplaints([])
    }
  }

  const handleBulkAction = (action: string) => {
    if (selectedComplaints.length === 0) {
      toast.error('Please select complaints first')
      return
    }

    switch (action) {
      case 'mark_pending':
        handleBulkStatusUpdate(ComplaintStatus.PENDING)
        break
      case 'mark_in_progress':
        handleBulkStatusUpdate(ComplaintStatus.IN_PROGRESS)
        break
      case 'mark_resolved':
        handleBulkStatusUpdate(ComplaintStatus.RESOLVED)
        break
      case 'delete':
        handleBulkDelete()
        break
      default:
        toast.error('Unknown action')
    }
  }

  const handleBulkStatusUpdate = async (status: ComplaintStatus) => {
    try {
      const promises = selectedComplaints.map(complaintId =>
        fetch(`/api/complaints/${complaintId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        })
      )

      await Promise.all(promises)
      toast.success(`Updated ${selectedComplaints.length} complaints`)
      fetchComplaints()
    } catch (error) {
      toast.error('Failed to update complaints')
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedComplaints.length} complaints?`)) {
      return
    }

    try {
      const promises = selectedComplaints.map(complaintId =>
        fetch(`/api/complaints/${complaintId}`, { method: 'DELETE' })
      )

      await Promise.all(promises)
      toast.success(`Deleted ${selectedComplaints.length} complaints`)
      fetchComplaints()
    } catch (error) {
      toast.error('Failed to delete complaints')
    }
  }

  const handleComplaintUpdate = (updatedComplaints: IComplaint[]) => {
    setComplaints(updatedComplaints)
    fetchComplaints()
  }

  const bulkActions = [
    { label: 'Mark as Pending', value: 'mark_pending', icon: Clock },
    { label: 'Mark as In Progress', value: 'mark_in_progress', icon: AlertCircle },
    { label: 'Mark as Resolved', value: 'mark_resolved', icon: CheckCircle },
    { label: 'Delete Complaints', value: 'delete', icon: ClipboardList }
  ]

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-slate-600">Loading complaints...</span>
        </div>
      )}

      {/* Complaints List */}
      <ComplaintList
        complaints={complaints}
        onComplaintsChange={handleComplaintUpdate}
        selectedComplaints={selectedComplaints}
        onComplaintSelect={handleComplaintSelection}
        onSelectAllComplaints={handleSelectAllComplaints}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        categoryFilter={categoryFilter}
        onFilterChange={handleFilterChange}
        staffMembers={initialStaff}
      />

      {/* Enhanced Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalComplaints}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        loading={loading}
        selectedItems={selectedComplaints}
        onBulkAction={handleBulkAction}
        bulkActions={bulkActions}
        showPageJump={totalComplaints > 50}
        showPageSizeSelector={true}
        className="border-0 shadow-2xl bg-gradient-to-br from-white via-slate-50 to-white"
      />
    </div>
  )
}
