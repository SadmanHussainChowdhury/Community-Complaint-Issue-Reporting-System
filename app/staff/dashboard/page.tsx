'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { IComplaint, IAnnouncement } from '@/types'
import { ComplaintStatus } from '@/types/enums'
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  Bell,
  Pin,
  PlayCircle,
  CheckCircle2,
  User,
  Calendar,
  MapPin,
  FileText,
  Loader2,
  TrendingUp,
  Activity,
  Zap,
  Users,
  Target,
  Award,
  Timer,
  Briefcase,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  MessageSquare,
  Settings,
  BarChart3,
  MoreHorizontal,
  Eye,
  Edit3,
  CheckCircle as CompletedIcon,
  AlertCircle
} from 'lucide-react'

export default function StaffDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [complaints, setComplaints] = useState<IComplaint[]>([])
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'tasks' | 'announcements'>('overview')

  const fetchData = useCallback(async (showRefresh = false) => {
    if (!session?.user) return

    try {
      if (showRefresh) setRefreshing(true)
      else setLoading(true)

      // Fetch assigned complaints
      const complaintsRes = await fetch(`/api/complaints?assignedTo=${session.user.id}`)

      if (complaintsRes.ok) {
        const complaintsData = await complaintsRes.json()
        setComplaints(complaintsData.data?.complaints || [])
      } else {
        console.error('Failed to fetch complaints:', complaintsRes.status)
      }

      // Fetch announcements
      const announcementsRes = await fetch('/api/announcements?limit=5')

      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json()
        setAnnouncements(announcementsData.data?.announcements || [])
      } else {
        console.error('Failed to fetch announcements:', announcementsRes.status)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [session])

  const handleRefresh = () => {
    fetchData(true)
  }

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
        // Update local state
        setComplaints(prev => prev.map(c =>
          c._id === complaintId ? { ...c, status: newStatus as ComplaintStatus } : c
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Dashboard</h2>
            <p className="text-gray-600">Fetching your assigned tasks...</p>
          </div>
        </div>
      </div>
    )
  }

  const pendingCount = complaints.filter(c => c.status === 'pending').length
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-80 h-80 bg-gradient-to-br from-accent/5 to-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <Navbar />

      {/* Ultra-Premium Hero Header */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-glow animate-glow-pulse">
                <Briefcase className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-accent/20 to-primary/20 rounded-3xl blur opacity-50 animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 text-premium animate-slide-up">
            Staff Portal
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Manage your assigned tasks with precision and efficiency
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Announcements Section */}
        {announcements.length > 0 && (
          <div className="mb-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <span className="text-premium">Important Announcements</span>
              </h2>
            </div>
            <div className="grid gap-6">
              {announcements.map((announcement, index) => (
                <div
                  key={announcement._id}
                  className={`card-premium group hover:scale-105 hover:shadow-2xl animate-fade-in ${
                    announcement.isPinned ? 'ring-2 ring-primary shadow-premium' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    {announcement.isPinned && (
                      <div className="flex-shrink-0">
                        <Pin className="w-6 h-6 text-primary-600 fill-current" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {announcement.title}
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {announcement.createdBy && typeof announcement.createdBy === 'object' && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{announcement.createdBy.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                        </div>
                        {announcement.expiresAt && (
                          <span className="text-orange-600 font-medium">
                            Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Dashboard */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            Performance Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Total Tasks</p>
                  <p className="text-3xl font-extrabold text-gray-900 group-hover:scale-110 transition-transform">
                    {complaints.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Assigned to you</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <ClipboardList className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            <div className="card group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Pending</p>
                  <p className="text-3xl font-extrabold text-gray-900 group-hover:scale-110 transition-transform">
                    {pendingCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <Clock className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            <div className="card group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">In Progress</p>
                  <p className="text-3xl font-extrabold text-gray-900 group-hover:scale-110 transition-transform">
                    {inProgressCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Currently working</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Activity className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            <div className="card group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Completed</p>
                  <p className="text-3xl font-extrabold text-gray-900 group-hover:scale-110 transition-transform">
                    {resolvedCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Successfully resolved</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        </div>

        {/* Tasks Management */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            My Assigned Tasks
          </h2>

          {complaints.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                <ClipboardList className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Tasks Assigned</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                You don&apos;t have any assigned complaints at the moment. New tasks will appear here when assigned by administrators.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {complaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="card group hover:scale-[1.01] transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {complaint.title}
                        </h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                          {complaint.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4 leading-relaxed">{complaint.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>
                            {typeof complaint.submittedBy === 'object'
                              ? complaint.submittedBy.name
                              : 'Unknown User'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>{complaint.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                    {complaint.status === 'pending' && (
                      <button
                        onClick={() => updateComplaintStatus(complaint._id, 'in_progress')}
                        disabled={updatingStatus === complaint._id}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        {updatingStatus === complaint._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <PlayCircle className="w-4 h-4" />
                        )}
                        Start Working
                      </button>
                    )}

                    {complaint.status === 'in_progress' && (
                      <button
                        onClick={() => updateComplaintStatus(complaint._id, 'resolved')}
                        disabled={updatingStatus === complaint._id}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        {updatingStatus === complaint._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Mark as Done
                      </button>
                    )}

                    {complaint.status === 'resolved' && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl shadow-lg">
                        <Award className="w-4 h-4" />
                        Completed Successfully
                      </div>
                    )}

                    <button
                      onClick={() => router.push(`/staff/complaints/${complaint._id}`)}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-primary-500 hover:text-primary-600 transition-all duration-200"
                    >
                      <FileText className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

