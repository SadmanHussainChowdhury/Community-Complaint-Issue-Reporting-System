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
  Plus,
  Eye,
  Edit,
  Activity,
  BarChart3,
} from 'lucide-react'
import { Loader } from '@/components/ui'
import Link from 'next/link'
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

export default function ResidentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [complaints, setComplaints] = useState<IComplaint[]>([])
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!session?.user) return

    try {
      setLoading(true)
      setError(null)

      // Fetch complaints
      const complaintsRes = await fetch('/api/complaints', {
        credentials: 'include'
      })
      if (complaintsRes.ok) {
        const complaintsData = await complaintsRes.json()
        if (complaintsData.success) {
          setComplaints(complaintsData.data?.complaints || [])
        } else {
          setError(complaintsData.error || 'Failed to load complaints')
          toast.error(complaintsData.error || 'Failed to load complaints')
        }
      } else {
        const errorData = await complaintsRes.json().catch(() => ({}))
        const errorMsg = errorData.error || 'Failed to load complaints'
        setError(errorMsg)
        toast.error(errorMsg)
      }

      // Fetch announcements
      const announcementsRes = await fetch('/api/announcements?limit=5', {
        credentials: 'include'
      })
      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json()
        if (announcementsData.success) {
          setAnnouncements(announcementsData.data?.announcements || [])
        }
      } else {
        // Don't show error for announcements, just log it
        console.error('Failed to load announcements')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      const errorMsg = 'Failed to load dashboard data'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchData()
  }, [session, status, router, fetchData])

  const pendingCount = complaints.filter((c: IComplaint) => c.status === 'pending').length
  const inProgressCount = complaints.filter((c: IComplaint) => c.status === 'in_progress').length
  const resolvedCount = complaints.filter((c: IComplaint) => c.status === 'resolved').length

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size="md" variant="primary" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resident Dashboard</h1>
              <p className="mt-2 text-gray-600">Manage your complaints and stay updated</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setError(null)
                fetchData()
              }}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 inline-flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader size="sm" variant="primary" /> : null}
              <span>Refresh</span>
            </button>
            <Link
              href="/resident/complaints/new"
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 inline-flex items-center space-x-2 transition-colors shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>New Complaint</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Complaints</p>
                <p className="text-3xl font-bold text-blue-900">{complaints.length}</p>
                <div className="flex items-center mt-2">
                  <ClipboardList className="w-4 h-4 text-blue-600 mr-1" />
                  <span className="text-xs text-blue-600">All submitted</span>
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
                  <span className="text-xs text-yellow-600">Awaiting review</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-indigo-900">{inProgressCount}</p>
                <div className="flex items-center mt-2">
                  <Activity className="w-4 h-4 text-indigo-600 mr-1" />
                  <span className="text-xs text-indigo-600">Being handled</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Resolved</p>
                <p className="text-3xl font-bold text-green-900">{resolvedCount}</p>
                <div className="flex items-center mt-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">
                    {complaints.length > 0
                      ? `${Math.round((resolvedCount / complaints.length) * 100)}% resolved`
                      : 'No complaints yet'
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
                  <Bell className="w-5 h-5 text-green-600 mr-2" />
                  Recent Announcements
                </h2>
              </div>
              <div className="space-y-3">
                {announcements.map((announcement: IAnnouncement) => (
                  <div
                    key={announcement._id}
                    className={`p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border ${
                      announcement.isPinned ? 'border-green-300 border-2' : 'border-green-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {announcement.isPinned && (
                            <Pin className="w-4 h-4 text-green-600 fill-current" />
                          )}
                          <h3 className="font-medium text-green-900">{announcement.title}</h3>
                        </div>
                        <p className="text-sm text-green-700 mb-3 line-clamp-2">{announcement.content}</p>
                        <div className="flex items-center gap-4 text-xs text-green-600">
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

        {/* Complaints Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <ClipboardList className="w-5 h-5 text-green-600 mr-2" />
              My Complaints
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
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <ClipboardList className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">No complaints yet</p>
                        <p className="text-sm text-gray-600 mb-4">Submit your first complaint to get started</p>
                        <Link
                          href="/resident/complaints/new"
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 inline-flex items-center space-x-2 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>New Complaint</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  complaints.map((complaint: IComplaint) => {
                    const assignedTo = typeof complaint.assignedTo === 'object' ? complaint.assignedTo : null

                    return (
                      <tr key={complaint._id} className="hover:bg-gray-50">
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
                            {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1).replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assignedTo?.name || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateForDisplay(complaint.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/resident/complaints/${complaint._id}`}
                              className="text-green-600 hover:text-green-900"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            {complaint.status !== ComplaintStatus.RESOLVED && (
                              <Link
                                href={`/resident/complaints/${complaint._id}/edit`}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit Complaint"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                            )}
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
