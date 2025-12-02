'use client'

import { useState, useEffect, useCallback } from 'react'
import { IComplaint, IUser } from '@/types'
import { ComplaintStatus, ComplaintPriority, ComplaintCategory } from '@/types/enums'
import StaffAssignment from '@/components/admin/StaffAssignment'
import StatusUpdate from '@/components/admin/StatusUpdate'
import Pagination from '@/components/ui/Pagination'
import { Search, Filter, Download, CheckCircle, Clock, AlertCircle, Loader2, ClipboardList, Target, User as UserIcon } from 'lucide-react'
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
  const [complaints, setComplaints] = useState(initialComplaints)
  const [staffMembers] = useState(initialStaff)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit)
  const [totalComplaints, setTotalComplaints] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<ComplaintPriority | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'all'>('all')
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

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
        setSelectedComplaints([]) // Clear selections on new data
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
    setCurrentPage(1) // Reset to first page when changing page size
    fetchComplaints(1, newSize)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
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
    setCurrentPage(1) // Reset to first page when filtering
  }

  // Bulk actions
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

  const handleBulkStatusUpdate = async (newStatus: ComplaintStatus) => {
    try {
      const promises = selectedComplaints.map(complaintId =>
        fetch(`/api/complaints/${complaintId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        })
      )

      await Promise.all(promises)
      toast.success(`Updated ${selectedComplaints.length} complaints to ${newStatus.replace('_', ' ')}`)
      fetchComplaints() // Refresh data
    } catch (error) {
      toast.error('Failed to update complaints')
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedComplaints.length} complaints? This action cannot be undone.`)) {
      return
    }

    try {
      const promises = selectedComplaints.map(complaintId =>
        fetch(`/api/complaints/${complaintId}`, { method: 'DELETE' })
      )

      await Promise.all(promises)
      toast.success(`Deleted ${selectedComplaints.length} complaints`)
      fetchComplaints() // Refresh data
    } catch (error) {
      toast.error('Failed to delete complaints')
    }
  }

  const handleExport = () => {
    // Create CSV export of current filtered results
    const csvContent = [
      ['Title', 'Category', 'Priority', 'Status', 'Submitted By', 'Assigned To', 'Created', 'Updated'].join(','),
      ...complaints.map(complaint => [
        `"${complaint.title}"`,
        complaint.category,
        complaint.priority,
        complaint.status,
        `"${complaint.submittedBy && typeof complaint.submittedBy === 'object' ? complaint.submittedBy.name : 'Unknown'}"`,
        `"${complaint.assignedTo && typeof complaint.assignedTo === 'object' ? complaint.assignedTo.name : 'Unassigned'}"`,
        new Date(complaint.createdAt).toLocaleDateString(),
        new Date(complaint.updatedAt).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `complaints-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Complaints exported successfully')
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

  const bulkActions = [
    { label: 'Mark as Pending', value: 'mark_pending', icon: Clock },
    { label: 'Mark as In Progress', value: 'mark_in_progress', icon: AlertCircle },
    { label: 'Mark as Resolved', value: 'mark_resolved', icon: CheckCircle },
    { label: 'Delete Complaints', value: 'delete', icon: ClipboardList }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header with Search and Filters */}
      <div className="p-8 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              All Complaints
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            {selectedComplaints.length > 0 && (
              <div className="text-sm text-primary-600 font-medium">
                {selectedComplaints.length} selected
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
                placeholder="Search complaints by title, description, or user..."
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
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
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Categories</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="security">Security</option>
                  <option value="noise">Noise</option>
                  <option value="cleanliness">Cleanliness</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedComplaints.length === complaints.length && complaints.length > 0}
                  onChange={(e) => handleSelectAllComplaints(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Complaint Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading complaints...</p>
                </td>
              </tr>
            ) : complaints.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                    <ClipboardList className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Complaints Yet</h3>
                  <p className="text-gray-600">Complaints will appear here when submitted by residents.</p>
                </td>
              </tr>
            ) : (
              complaints.map((complaint) => {
                const submittedBy = typeof complaint.submittedBy === 'object' ? complaint.submittedBy : null
                const assignedTo = typeof complaint.assignedTo === 'object' ? complaint.assignedTo : null

                return (
                  <tr key={complaint._id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                    <td className="px-6 py-6">
                      <input
                        type="checkbox"
                        checked={selectedComplaints.includes(complaint._id)}
                        onChange={(e) => handleComplaintSelection(complaint._id, e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {complaint.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {complaint.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <UserIcon className="w-4 h-4" />
                              <span>{submittedBy?.name || 'Unknown'}</span>
                            </div>
                            <span>{complaint.category.replace('_', ' ')}</span>
                            <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                        {complaint.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      {assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {assignedTo.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {assignedTo.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        {/* Staff Assignment */}
                        <StaffAssignment
                          complaintId={complaint._id}
                          currentAssigned={assignedTo}
                          staffMembers={staffMembers}
                        />

                        {/* Status Update */}
                        <StatusUpdate
                          complaintId={complaint._id}
                          currentStatus={complaint.status}
                        />

                        {/* View Details */}
                        <a
                          href={`/admin/complaints/${complaint._id}`}
                          className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                          title="View Details"
                        >
                          <UserIcon className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalComplaints}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={handleSearchChange}
        searchQuery={searchQuery}
        loading={loading}
        bulkActions={bulkActions}
        selectedItems={selectedComplaints}
        onBulkAction={handleBulkAction}
        onExport={handleExport}
        showPageJump={totalComplaints > itemsPerPage * 5}
        showPageSizeSelector={true}
        className="border-0 shadow-2xl bg-gradient-to-br from-white via-slate-50 to-white"
      />

      {complaints.length > 0 && !loading && (
        <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Page {currentPage} of {Math.ceil(initialTotal / initialLimit)}</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                Real-time updates enabled
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
