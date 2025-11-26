'use client'

import { useState, useEffect, useCallback } from 'react'
import ComplaintList from '@/components/admin/ComplaintList'
import { IComplaint, IUser } from '@/types'
import { UserRole, ComplaintStatus } from '@/types/enums'
import {
  Users,
  UserCheck,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  TrendingUp,
  Briefcase,
  Zap,
  Target,
  Award,
  Loader2,
  PlayCircle,
  CheckCircle2
} from 'lucide-react'

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<IComplaint[]>([])
  const [staffMembers, setStaffMembers] = useState<IUser[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [assigningTask, setAssigningTask] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch all complaints
      const complaintsRes = await fetch('/api/complaints', {
        credentials: 'include'
      })

      if (complaintsRes.ok) {
        const complaintsData = await complaintsRes.json()
        setComplaints(complaintsData.data?.complaints || [])
      }

      // Fetch staff members for assignment
      const staffRes = await fetch('/api/users?role=staff', {
        credentials: 'include'
      })

      if (staffRes.ok) {
        const staffData = await staffRes.json()
        setStaffMembers(staffData.data?.users || [])
      }
    } catch (err) {
      setError('Failed to load data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateComplaintStatus = async (complaintId: string, newStatus: string) => {
    setUpdatingStatus(complaintId)

    try {
      const res = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      })

      if (res.ok) {
        setComplaints(prev => prev.map(c =>
          c._id === complaintId ? { ...c, status: newStatus as any } : c
        ))
      } else {
        console.error('Failed to update complaint status')
      }
    } catch (error) {
      console.error('Error updating complaint status:', error)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const assignComplaintToStaff = async (complaintId: string, staffId: string) => {
    setAssigningTask(complaintId)

    try {
      const res = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignedTo: staffId }),
        credentials: 'include',
      })

      if (res.ok) {
        const staffMember = staffMembers.find(s => s._id === staffId)
        setComplaints(prev => prev.map(c =>
          c._id === complaintId ? { ...c, assignedTo: staffMember || staffId } : c
        ))
      } else {
        console.error('Failed to assign complaint')
      }
    } catch (error) {
      console.error('Error assigning complaint:', error)
    } finally {
      setAssigningTask(null)
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Complaints Management</h2>
            <p className="text-gray-600">Fetching all complaints and staff data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  const pendingCount = complaints.filter(c => c.status === 'pending').length
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length
  const unassignedCount = complaints.filter(c => !c.assignedTo).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow animate-glow">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
              <span className="gradient-text">Complaints Management</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Assign tasks to staff and manage complaint status with full administrative control
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Dashboard */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            System Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="premium-card group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Total Complaints</p>
                  <p className="text-3xl font-extrabold text-gray-900 group-hover:scale-110 transition-transform">
                    {complaints.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">All community issues</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <ClipboardList className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            <div className="premium-card group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Unassigned</p>
                  <p className="text-3xl font-extrabold text-gray-900 group-hover:scale-110 transition-transform">
                    {unassignedCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Need staff assignment</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <AlertTriangle className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            <div className="premium-card group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">In Progress</p>
                  <p className="text-3xl font-extrabold text-gray-900 group-hover:scale-110 transition-transform">
                    {inProgressCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Being worked on</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <Clock className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            <div className="premium-card group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Resolved</p>
                  <p className="text-3xl font-extrabold text-gray-900 group-hover:scale-110 transition-transform">
                    {resolvedCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Successfully completed</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        </div>

        {/* Complaints Management Table */}
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
                {complaints.length === 0 ? (
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
                            {/* Assign to Staff */}
                            <div className="relative">
                              <select
                                value={assignedTo?._id || ''}
                                onChange={(e) => assignComplaintToStaff(complaint._id, e.target.value)}
                                disabled={assigningTask === complaint._id}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                              >
                                <option value="">Assign Staff</option>
                                {staffMembers.map((staff) => (
                                  <option key={staff._id} value={staff._id}>
                                    {staff.name}
                                  </option>
                                ))}
                              </select>
                              {assigningTask === complaint._id && (
                                <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-primary-600" />
                              )}
                            </div>

                            {/* Status Update Buttons */}
                            <div className="flex gap-2">
                              {complaint.status === 'pending' && (
                                <button
                                  onClick={() => updateComplaintStatus(complaint._id, 'in_progress')}
                                  disabled={updatingStatus === complaint._id}
                                  className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                                >
                                  {updatingStatus === complaint._id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <PlayCircle className="w-3 h-3" />
                                  )}
                                  Start
                                </button>
                              )}

                              {complaint.status === 'in_progress' && (
                                <button
                                  onClick={() => updateComplaintStatus(complaint._id, 'resolved')}
                                  disabled={updatingStatus === complaint._id}
                                  className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                                >
                                  {updatingStatus === complaint._id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-3 h-3" />
                                  )}
                                  Complete
                                </button>
                              )}

                              {complaint.status === 'resolved' && (
                                <div className="flex items-center gap-1 px-3 py-2 bg-emerald-100 text-emerald-800 text-sm rounded-lg">
                                  <Award className="w-3 h-3" />
                                  Done
                                </div>
                              )}
                            </div>

                            {/* View Details */}
                            <a
                              href={`/admin/complaints/${complaint._id}`}
                              className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                              title="View Details"
                            >
                              <User className="w-4 h-4" />
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

          {complaints.length > 0 && (
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Showing {complaints.length} complaints</span>
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
      </div>
    </div>
  )
}

