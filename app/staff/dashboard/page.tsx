'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { IComplaint, IAnnouncement } from '@/types'
import { ComplaintStatus } from '@/types/enums'
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
  Pin,
  PlayCircle,
  CheckCircle2,
  Activity,
  BarChart3,
  Eye,
  Award,
} from 'lucide-react'
import { formatDateForDisplay } from '@/lib/utils'
import toast from 'react-hot-toast'

const statusColors = {
  [ComplaintStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ComplaintStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [ComplaintStatus.RESOLVED]: 'bg-green-100 text-green-800',
  [ComplaintStatus.CANCELLED]: 'bg-red-100 text-red-800',
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

export default function StaffDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [complaints, setComplaints] = useState<IComplaint[]>([])
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const fetchData = useCallback(async (showRefresh = false) => {
    if (!session?.user?.id) {
      console.error('No session or user ID available')
      return
    }

    try {
      if (showRefresh) setRefreshing(true)
      else setLoading(true)

      // Fetch assigned complaints
      const complaintsRes = await fetch(`/api/complaints?assignedTo=${session.user.id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (complaintsRes.ok) {
        const complaintsData = await complaintsRes.json()
        if (complaintsData.success) {
          setComplaints(complaintsData.data?.complaints || [])
        } else {
          const errorMsg = complaintsData.error || 'Failed to load complaints'
          if (showRefresh) {
            toast.error(errorMsg)
          } else {
            console.error('Failed to load complaints:', errorMsg)
          }
        }
      } else {
        const errorData = await complaintsRes.json().catch(() => ({ error: 'Unknown error' }))
        const errorMsg = errorData.error || `Failed to fetch complaints (${complaintsRes.status})`
        if (showRefresh) {
          toast.error(errorMsg)
        } else {
          console.error('Failed to fetch complaints:', complaintsRes.status, errorMsg)
        }
      }

      // Fetch announcements
      const announcementsRes = await fetch('/api/announcements?limit=5', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json()
        if (announcementsData.success) {
          setAnnouncements(announcementsData.data?.announcements || [])
        } else {
          if (showRefresh) {
            toast.error(announcementsData.error || 'Failed to refresh announcements')
          }
        }
      } else {
        if (showRefresh) {
          toast.error('Failed to refresh announcements')
        }
        console.error('Failed to fetch announcements:', announcementsRes.status)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      const errorMsg = error instanceof Error ? error.message : 'Failed to load data'
      if (showRefresh) {
        toast.error(errorMsg)
      } else {
        toast.error('Failed to load dashboard data')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [session])

  const handleRefresh = () => {
    fetchData(true)
  }

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchData()
  }, [session, status, router, fetchData])

  const updateComplaintStatus = useCallback(async (complaintId: string, newStatus: string) => {
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
        const data = await res.json()
        if (data.success) {
          // Refresh data to get latest from server
          await fetchData(false)
          const statusLabel = newStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          toast.success(`Complaint status updated to ${statusLabel}`)
        } else {
          toast.error(data.error || 'Failed to update complaint status')
        }
      } else {
        const errorData = await res.json().catch(() => ({}))
        toast.error(errorData.error || 'Failed to update complaint status')
        console.error('Failed to update complaint status:', res.status, errorData)
      }
    } catch (error) {
      console.error('Error updating complaint status:', error)
      toast.error('An error occurred while updating status')
    } finally {
      setUpdatingStatus(null)
    }
  }, [fetchData])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Dashboard</h2>
            <p className="text-gray-600">Fetching your assigned tasks...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  const pendingCount = complaints.filter(c => c.status === ComplaintStatus.PENDING).length
  const inProgressCount = complaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS).length
  const resolvedCount = complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Staff Dashboard</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Manage your assigned tasks and track performance</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 inline-flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
          >
            {refreshing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
            ) : null}
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Tasks</p>
                <p className="text-3xl font-bold text-blue-900">{complaints.length}</p>
                <div className="flex items-center mt-2">
                  <ClipboardList className="w-4 h-4 text-blue-600 mr-1" />
                  <span className="text-xs text-blue-600">Assigned to you</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-900">{pendingCount}</p>
                <div className="flex items-center mt-2">
                  <Clock className="w-4 h-4 text-yellow-600 mr-1" />
                  <span className="text-xs text-yellow-600">Awaiting action</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-blue-900">{inProgressCount}</p>
                <div className="flex items-center mt-2">
                  <Activity className="w-4 h-4 text-blue-600 mr-1" />
                  <span className="text-xs text-blue-600">Currently working</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-900">{resolvedCount}</p>
                <div className="flex items-center mt-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">
                    {complaints.length > 0
                      ? `${Math.round((resolvedCount / complaints.length) * 100)}% completion rate`
                      : 'No tasks yet'
                    }
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Announcements Section */}
        {announcements.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Bell className="w-5 h-5 text-indigo-600 mr-2" />
                  Recent Announcements
                </h2>
              </div>
              <div className="space-y-3">
                {announcements.map((announcement: IAnnouncement) => (
                  <div
                    key={announcement._id}
                    className={`p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border ${
                      announcement.isPinned ? 'border-indigo-300 border-2' : 'border-indigo-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {announcement.isPinned && (
                            <Pin className="w-4 h-4 text-indigo-600 fill-current" />
                          )}
                          <h3 className="font-medium text-indigo-900">{announcement.title}</h3>
                        </div>
                        <p className="text-sm text-indigo-700 mb-3 line-clamp-2">{announcement.content}</p>
                        <div className="flex items-center gap-4 text-xs text-indigo-600">
                          {announcement.createdBy && typeof announcement.createdBy === 'object' && (
                            <span>By {announcement.createdBy.name}</span>
                          )}
                          <span>{formatDateForDisplay(announcement.createdAt)}</span>
                          {announcement.expiresAt && (
                            <span className="text-orange-600">
                              Expires: {formatDateForDisplay(announcement.expiresAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Assigned Tasks Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <ClipboardList className="w-5 h-5 text-indigo-600 mr-2" />
              My Assigned Tasks
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <ClipboardList className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">No Tasks Assigned</p>
                        <p className="text-sm text-gray-600">
                          You don&apos;t have any assigned complaints at the moment. New tasks will appear here when assigned by administrators.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  complaints.map((complaint) => {
                    const submittedBy = typeof complaint.submittedBy === 'object' && complaint.submittedBy !== null 
                      ? complaint.submittedBy 
                      : null
                    const submittedByName = submittedBy?.name || (typeof complaint.submittedBy === 'string' ? 'Loading...' : 'Unknown')

                    return (
                      <tr key={complaint._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{complaint.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{complaint.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 capitalize">{complaint.category.replace(/_/g, ' ')}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              priorityColors[complaint.priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800'
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
                            {complaint.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submittedByName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateForDisplay(complaint.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {complaint.status === ComplaintStatus.PENDING && (
                              <button
                                onClick={() => updateComplaintStatus(complaint._id, ComplaintStatus.IN_PROGRESS)}
                                disabled={updatingStatus === complaint._id}
                                className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all text-xs disabled:opacity-50"
                                title="Start Working"
                              >
                                {updatingStatus === complaint._id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                ) : (
                                  <PlayCircle className="w-3 h-3" />
                                )}
                                Start
                              </button>
                            )}

                            {complaint.status === ComplaintStatus.IN_PROGRESS && (
                              <button
                                onClick={() => updateComplaintStatus(complaint._id, ComplaintStatus.RESOLVED)}
                                disabled={updatingStatus === complaint._id}
                                className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all text-xs disabled:opacity-50"
                                title="Mark as Done"
                              >
                                {updatingStatus === complaint._id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                ) : (
                                  <CheckCircle2 className="w-3 h-3" />
                                )}
                                Complete
                              </button>
                            )}

                            {complaint.status === ComplaintStatus.RESOLVED && (
                              <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-xs">
                                <Award className="w-3 h-3" />
                                Done
                              </div>
                            )}

                            <button
                              onClick={() => router.push(`/staff/complaints/${complaint._id}`)}
                              className="text-primary-600 hover:text-primary-900"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
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
      </div>
    </div>
  )
}
