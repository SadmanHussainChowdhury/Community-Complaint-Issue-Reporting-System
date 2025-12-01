'use client'

import { useState, useEffect } from 'react'
import { IComplaint, IUser } from '@/types'
import StaffAssignment from '@/components/admin/StaffAssignment'
import StatusUpdate from '@/components/admin/StatusUpdate'
import Pagination from '@/components/ui/Pagination'
import {
  Users,
  ClipboardList,
  User as UserIcon,
  Target
} from 'lucide-react'

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
  const [loading, setLoading] = useState(false)

  const fetchComplaints = async (page: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/complaints?page=${page}&limit=${initialLimit}`)
      if (res.ok) {
        const data = await res.json()
        setComplaints(data.data.complaints || [])
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Error fetching complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    fetchComplaints(page)
  }

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
      <div className="p-8 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              All Complaints
            </h2>
            <p className="text-gray-600 mt-2">Manage complaint assignments and status updates</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {staffMembers.length} Staff Members Available
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
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
                              <User className="w-4 h-4" />
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
        totalItems={initialTotal}
        itemsPerPage={initialLimit}
        onPageChange={handlePageChange}
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
