'use client'

import { useState } from 'react'
import { IAssignment } from '@/types'
import { Calendar, User, Clock, CheckCircle, XCircle, Search } from 'lucide-react'
import toast from 'react-hot-toast'

interface AssignmentListProps {
  assignments: IAssignment[]
  onAssignmentsChange?: (assignments: IAssignment[]) => void
  onAssignmentSelect?: (assignmentId: string, selected: boolean) => void
  onSelectAllAssignments?: (selected: boolean) => void
  selectedAssignments?: string[]
  loading?: boolean
  searchQuery?: string
  onSearchChange?: (query: string) => void
  statusFilter?: 'all' | 'pending' | 'in_progress' | 'completed'
  onFilterChange?: (type: 'status', value: string) => void
}

const statusColors = {
  active: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function AssignmentList({
  assignments: initialAssignments,
  onAssignmentsChange,
  onAssignmentSelect,
  onSelectAllAssignments,
  selectedAssignments = [],
  loading: externalLoading = false,
  searchQuery: externalSearchQuery = '',
  onSearchChange,
  statusFilter: externalStatusFilter = 'all',
  onFilterChange
}: AssignmentListProps) {
  const [assignments, setAssignments] = useState(initialAssignments)
  const [internalLoading, setInternalLoading] = useState(false)

  const loading = externalLoading || internalLoading

  const filteredAssignments = assignments.filter((assignment) => {
    const complaint = typeof assignment.complaint === 'object' ? assignment.complaint : null
    const assignedTo = typeof assignment.assignedTo === 'object' ? assignment.assignedTo : null
    
    const matchesSearch = !externalSearchQuery ||
      complaint?.title?.toLowerCase().includes(externalSearchQuery.toLowerCase()) ||
      assignedTo?.name?.toLowerCase().includes(externalSearchQuery.toLowerCase())
    const matchesStatus = externalStatusFilter === 'all' || assignment.status === externalStatusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search assignments..."
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
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {onAssignmentSelect && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedAssignments.length === filteredAssignments.length && filteredAssignments.length > 0}
                    onChange={(e) => onSelectAllAssignments?.(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Complaint
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={onAssignmentSelect ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-3">Loading assignments...</span>
                  </div>
                </td>
              </tr>
            ) : filteredAssignments.length === 0 ? (
              <tr>
                <td colSpan={onAssignmentSelect ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                  No assignments found
                </td>
              </tr>
            ) : (
              filteredAssignments.map((assignment) => {
                const complaint = typeof assignment.complaint === 'object' ? assignment.complaint : null
                const assignedTo = typeof assignment.assignedTo === 'object' ? assignment.assignedTo : null
                const assignedBy = typeof assignment.assignedBy === 'object' ? assignment.assignedBy : null

                return (
                  <tr key={assignment._id} className="hover:bg-gray-50">
                    {onAssignmentSelect && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedAssignments.includes(assignment._id)}
                          onChange={(e) => onAssignmentSelect(assignment._id, e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{complaint?.title || 'Unknown'}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{complaint?.description || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignedTo?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignedBy?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[assignment.status] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(assignment.assignedAt).toLocaleDateString()}
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
