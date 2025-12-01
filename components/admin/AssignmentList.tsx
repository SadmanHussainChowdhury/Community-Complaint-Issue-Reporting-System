'use client'

import { useState } from 'react'
import { IAssignment } from '@/types'
import { Calendar, User, Clock, CheckCircle, XCircle, Search, Filter, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface AssignmentListProps {
  assignments: IAssignment[]
  onAssignmentsChange?: (assignments: IAssignment[]) => void
}

const statusColors = {
  active: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

const statusIcons = {
  active: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
}

export default function AssignmentList({ assignments: initialAssignments, onAssignmentsChange }: AssignmentListProps) {
  const [assignments, setAssignments] = useState(initialAssignments)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const filteredAssignments = assignments.filter((assignment) => {
    const complaint = typeof assignment.complaint === 'object' ? assignment.complaint : null
    const assignedTo = typeof assignment.assignedTo === 'object' ? assignment.assignedTo : null

    const matchesSearch =
      (complaint?.title && complaint.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (assignedTo?.name && assignedTo.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = !statusFilter || assignment.status === statusFilter

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Status</option>
            <option value="active">🔄 Active</option>
            <option value="completed">✅ Completed</option>
            <option value="cancelled">❌ Cancelled</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      <div className="p-6">
        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => {
              const complaint = typeof assignment.complaint === 'object' ? assignment.complaint : null
              const assignedTo = typeof assignment.assignedTo === 'object' ? assignment.assignedTo : null
              const assignedBy = typeof assignment.assignedBy === 'object' ? assignment.assignedBy : null

              const StatusIcon = statusIcons[assignment.status] || Clock

              return (
                <div
                  key={assignment._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-200 bg-gradient-to-r from-white to-gray-50/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Complaint Title */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center border border-red-200">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                            {complaint?.title || 'Unknown Complaint'}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {complaint?.description || 'No description available'}
                          </p>
                        </div>
                      </div>

                      {/* Assignment Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Assigned To */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center border border-blue-200">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">ASSIGNED TO</p>
                            <p className="text-sm font-medium text-gray-900">{assignedTo?.name || 'Unknown'}</p>
                          </div>
                        </div>

                        {/* Assigned By */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center border border-purple-200">
                            <User className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">ASSIGNED BY</p>
                            <p className="text-sm font-medium text-gray-900">{assignedBy?.name || 'Unknown'}</p>
                          </div>
                        </div>

                        {/* Due Date */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center border border-green-200">
                            <Calendar className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">DUE DATE</p>
                            <p className="text-sm font-medium text-gray-900">
                              {assignment.dueDate
                                ? new Date(assignment.dueDate).toLocaleDateString()
                                : 'No due date'
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status and Metadata */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusColors[assignment.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                            <StatusIcon className="w-4 h-4" />
                            <span className="text-sm font-semibold capitalize">{assignment.status}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Assigned {new Date(assignment.assignedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {assignment.notes && (
                          <div className="text-sm text-gray-600 max-w-xs">
                            <span className="font-medium">Note:</span> {assignment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {filteredAssignments.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 text-sm text-gray-600 bg-gray-50 rounded-b-lg">
          Showing {filteredAssignments.length} of {assignments.length} assignments
        </div>
      )}
    </div>
  )
}

