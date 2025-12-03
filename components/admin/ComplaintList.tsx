'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IComplaint, IUser } from '@/types'
import { ComplaintStatus, ComplaintPriority, ComplaintCategory } from '@/types/enums'
import { Eye, Edit, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import StaffAssignment from '@/components/admin/StaffAssignment'
import StatusUpdate from '@/components/admin/StatusUpdate'

interface ComplaintListProps {
  complaints: IComplaint[]
  onComplaintsChange?: (complaints: IComplaint[]) => void
  selectedComplaints?: string[]
  onComplaintSelect?: (complaintId: string, selected: boolean) => void
  onSelectAllComplaints?: (selected: boolean) => void
  loading?: boolean
  searchQuery?: string
  onSearchChange?: (query: string) => void
  statusFilter?: ComplaintStatus | 'all'
  priorityFilter?: ComplaintPriority | 'all'
  categoryFilter?: ComplaintCategory | 'all'
  onFilterChange?: (type: 'status' | 'priority' | 'category', value: string) => void
  staffMembers?: IUser[]
}

const statusColors = {
  [ComplaintStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ComplaintStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [ComplaintStatus.RESOLVED]: 'bg-green-100 text-green-800',
  [ComplaintStatus.CANCELLED]: 'bg-red-100 text-red-800',
}

const priorityColors = {
  [ComplaintPriority.LOW]: 'bg-gray-100 text-gray-800',
  [ComplaintPriority.MEDIUM]: 'bg-blue-100 text-blue-800',
  [ComplaintPriority.HIGH]: 'bg-orange-100 text-orange-800',
  [ComplaintPriority.URGENT]: 'bg-red-100 text-red-800',
}

export default function ComplaintList({
  complaints: initialComplaints,
  onComplaintsChange,
  selectedComplaints = [],
  onComplaintSelect,
  onSelectAllComplaints,
  loading: externalLoading = false,
  searchQuery: externalSearchQuery = '',
  onSearchChange,
  statusFilter: externalStatusFilter = 'all',
  priorityFilter: externalPriorityFilter = 'all',
  categoryFilter: externalCategoryFilter = 'all',
  onFilterChange,
  staffMembers = []
}: ComplaintListProps) {
  const [complaints, setComplaints] = useState(initialComplaints)
  const [internalLoading, setInternalLoading] = useState(false)

  const loading = externalLoading || internalLoading

  // Use external filters if provided, otherwise filter locally
  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch = !externalSearchQuery ||
      complaint.title.toLowerCase().includes(externalSearchQuery.toLowerCase()) ||
      complaint.description.toLowerCase().includes(externalSearchQuery.toLowerCase())
    const matchesStatus = externalStatusFilter === 'all' || complaint.status === externalStatusFilter
    const matchesPriority = externalPriorityFilter === 'all' || complaint.priority === externalPriorityFilter
    const matchesCategory = externalCategoryFilter === 'all' || complaint.category === externalCategoryFilter
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this complaint?')) return

    setInternalLoading(true)
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Complaint deleted successfully')
        const updatedComplaints = complaints.filter((c) => c._id !== id)
        setComplaints(updatedComplaints)
        onComplaintsChange?.(updatedComplaints)
      } else {
        toast.error(data.error || 'Failed to delete complaint')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setInternalLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search complaints..."
              value={externalSearchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={externalStatusFilter}
            onChange={(e) => onFilterChange?.('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Statuses</option>
            {Object.values(ComplaintStatus).map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
          <select
            value={externalPriorityFilter}
            onChange={(e) => onFilterChange?.('priority', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Priorities</option>
            {Object.values(ComplaintPriority).map((priority) => (
              <option key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={externalCategoryFilter}
            onChange={(e) => onFilterChange?.('category', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Categories</option>
            {Object.values(ComplaintCategory).map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {onComplaintSelect && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedComplaints.length === filteredComplaints.length && filteredComplaints.length > 0}
                    onChange={(e) => onSelectAllComplaints?.(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
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
                <td colSpan={onComplaintSelect ? 9 : 8} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-3">Loading complaints...</span>
                  </div>
                </td>
              </tr>
            ) : filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan={onComplaintSelect ? 9 : 8} className="px-6 py-12 text-center text-gray-500">
                  No complaints found
                </td>
              </tr>
            ) : (
              filteredComplaints.map((complaint) => {
                const submittedBy = typeof complaint.submittedBy === 'object' ? complaint.submittedBy : null
                const assignedTo = typeof complaint.assignedTo === 'object' ? complaint.assignedTo : null

                return (
                  <tr key={complaint._id} className="hover:bg-gray-50">
                    {onComplaintSelect && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedComplaints.includes(complaint._id)}
                          onChange={(e) => onComplaintSelect(complaint._id, e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{complaint.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{complaint.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">{complaint.category.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          priorityColors[complaint.priority as ComplaintPriority] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[complaint.status as ComplaintStatus] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submittedBy?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignedTo?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {staffMembers.length > 0 && (
                          <StaffAssignment
                            complaintId={complaint._id}
                            currentAssigned={assignedTo}
                            staffMembers={staffMembers}
                          />
                        )}
                        <StatusUpdate
                          complaintId={complaint._id}
                          currentStatus={complaint.status}
                        />
                        <Link
                          href={`/admin/complaints/${complaint._id}`}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(complaint._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Complaint"
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
