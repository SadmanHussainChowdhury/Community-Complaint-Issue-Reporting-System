import { Suspense } from 'react'
import Link from 'next/link'
import {
  Users,
  ClipboardList,
  Bell,
  UserCheck,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  BarChart3,
  Settings,
  Shield,
  Zap
} from 'lucide-react'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Complaint from '@/models/Complaint'
import Announcement from '@/models/Announcement'
import Assignment from '@/models/Assignment'
import { UserRole, ComplaintStatus } from '@/types/enums'
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard'
import { DashboardStats, IComplaint, IUser } from '@/types'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  await connectDB()

  // Get counts
  const [
    totalUsers,
    totalComplaints,
    totalAnnouncements,
    totalAssignments,
    pendingComplaints,
    inProgressComplaints,
    resolvedComplaints,
    staffCount,
    residentCount
  ] = await Promise.all([
    User.countDocuments(),
    Complaint.countDocuments(),
    Announcement.countDocuments(),
    Assignment.countDocuments(),
    Complaint.countDocuments({ status: ComplaintStatus.PENDING }),
    Complaint.countDocuments({ status: ComplaintStatus.IN_PROGRESS }),
    Complaint.countDocuments({ status: ComplaintStatus.RESOLVED }),
    User.countDocuments({ role: UserRole.STAFF }),
    User.countDocuments({ role: UserRole.RESIDENT })
  ])

  // Get recent activity
  const recentComplaints = await Complaint.find({})
    .populate('submittedBy', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()

  const recentUsers = await User.find({})
    .select('name email role createdAt')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()

  const recentAnnouncements = await Announcement.find({})
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .limit(3)
    .lean()

  // Get complaints by category and priority
  const complaintsByCategory = await Complaint.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ])

  const complaintsByPriority = await Complaint.aggregate([
    { $group: { _id: '$priority', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ])

  // Get recent complaints for analytics
  const recentComplaintsForStats = await Complaint.find({})
    .populate('submittedBy', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

  // Get staff performance data
  const staffUsers = await User.find({ role: UserRole.STAFF }).select('_id name')

  const staffPerformance = await Promise.all(
    staffUsers.map(async (staff) => {
      const assignedCount = await Complaint.countDocuments({ assignedTo: staff._id })
      const resolvedCount = await Complaint.countDocuments({
        assignedTo: staff._id,
        status: ComplaintStatus.RESOLVED
      })

      // Calculate average resolution time (simplified)
      const resolvedComplaints = await Complaint.find({
        assignedTo: staff._id,
        status: ComplaintStatus.RESOLVED,
        createdAt: { $exists: true },
        updatedAt: { $exists: true }
      }).select('createdAt updatedAt')

      let averageResolutionTime = 0
      if (resolvedComplaints.length > 0) {
        const totalTime = resolvedComplaints.reduce((acc, complaint) => {
          const created = new Date(complaint.createdAt).getTime()
          const updated = new Date(complaint.updatedAt).getTime()
          return acc + (updated - created)
        }, 0)
        averageResolutionTime = Math.round((totalTime / resolvedComplaints.length) / (1000 * 60 * 60 * 24)) // days
      }

      return {
        staffId: staff._id.toString(),
        staffName: staff.name,
        assignedCount,
        resolvedCount,
        averageResolutionTime
      }
    })
  )

  // Create stats object for AnalyticsDashboard
  // Convert all MongoDB objects to plain objects for client component
  const stats: DashboardStats = {
    totalComplaints,
    pendingComplaints,
    inProgressComplaints,
    resolvedComplaints,
    complaintsByCategory: complaintsByCategory.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {} as Record<string, number>),
    complaintsByPriority: complaintsByPriority.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {} as Record<string, number>),
    recentComplaints: recentComplaintsForStats.map(c => {
      // Convert populated fields to plain objects
      // Ensure submittedBy is never null (required field)
      let submittedBy: string | IUser
      if (c.submittedBy) {
        if (typeof c.submittedBy === 'object' && '_id' in c.submittedBy) {
          submittedBy = {
            _id: String(c.submittedBy._id),
            name: String(c.submittedBy.name || ''),
            email: String(c.submittedBy.email || ''),
            password: '',
            role: UserRole.RESIDENT,
            isActive: true,
            createdAt: new Date(0), // Fixed date for consistency
            updatedAt: new Date(0) // Fixed date for consistency
          }
        } else {
          submittedBy = String(c.submittedBy)
        }
      } else {
        submittedBy = 'unknown'
      }

      // assignedTo is optional, but if present, must not be null
      let assignedTo: string | IUser | undefined
      if (c.assignedTo) {
        if (typeof c.assignedTo === 'object' && '_id' in c.assignedTo) {
          assignedTo = {
            _id: String(c.assignedTo._id),
            name: String(c.assignedTo.name || ''),
            email: String(c.assignedTo.email || ''),
            password: '',
            role: UserRole.STAFF,
            isActive: true,
            createdAt: new Date(0), // Fixed date for consistency
            updatedAt: new Date(0) // Fixed date for consistency
          }
        } else {
          assignedTo = String(c.assignedTo)
        }
      }

      return {
        _id: String(c._id),
        title: String(c.title),
        description: String(c.description),
        category: c.category,
        priority: c.priority,
        status: c.status,
        submittedBy,
        assignedTo,
        images: Array.isArray(c.images) ? c.images.map(img => String(img)) : [],
        location: c.location ? {
          building: c.location.building ? String(c.location.building) : undefined,
          floor: c.location.floor ? String(c.location.floor) : undefined,
          room: c.location.room ? String(c.location.room) : undefined
        } : undefined,
        communityId: c.communityId ? String(c.communityId) : undefined,
        notes: Array.isArray(c.notes) ? c.notes.map(note => ({
          content: String(note.content || ''),
          addedBy: typeof note.addedBy === 'object' && '_id' in note.addedBy
            ? String(note.addedBy._id)
            : String(note.addedBy || ''),
          addedAt: note.addedAt ? new Date(note.addedAt) : new Date(),
          isInternal: Boolean(note.isInternal)
        })) : [],
        resolutionProof: Array.isArray(c.resolutionProof) ? c.resolutionProof.map(proof => String(proof)) : [],
        resolvedAt: c.resolvedAt ? new Date(c.resolvedAt) : undefined,
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date()
      } as IComplaint
    }),
    staffPerformance: staffPerformance.map(sp => ({
      staffId: String(sp.staffId),
      staffName: String(sp.staffName),
      assignedCount: Number(sp.assignedCount),
      resolvedCount: Number(sp.resolvedCount),
      averageResolutionTime: Number(sp.averageResolutionTime)
    }))
  }

  // Convert recentActivity data to plain objects
  const serializedRecentComplaints = recentComplaints.map(c => ({
    _id: String(c._id),
    title: String(c.title),
    status: c.status,
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
    submittedBy: c.submittedBy 
      ? (typeof c.submittedBy === 'object' && '_id' in c.submittedBy
          ? { _id: String(c.submittedBy._id), name: String(c.submittedBy.name || ''), email: String(c.submittedBy.email || '') }
          : typeof c.submittedBy === 'string'
            ? { _id: c.submittedBy, name: '', email: '' }
            : null)
      : null,
    assignedTo: c.assignedTo
      ? (typeof c.assignedTo === 'object' && '_id' in c.assignedTo
          ? { _id: String(c.assignedTo._id), name: String(c.assignedTo.name || ''), email: String(c.assignedTo.email || '') }
          : typeof c.assignedTo === 'string'
            ? { _id: c.assignedTo, name: '', email: '' }
            : null)
      : null
  }))

  const serializedRecentUsers = recentUsers.map(u => ({
    _id: String(u._id),
    name: String(u.name),
    email: String(u.email),
    role: u.role,
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString()
  }))

  const serializedRecentAnnouncements = recentAnnouncements.map(a => ({
    _id: String(a._id),
    title: String(a.title),
    content: String(a.content),
    createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
    createdBy: a.createdBy
      ? (typeof a.createdBy === 'object' && '_id' in a.createdBy
          ? { _id: String(a.createdBy._id), name: String(a.createdBy.name || '') }
          : typeof a.createdBy === 'string'
            ? { _id: a.createdBy, name: '' }
            : null)
      : null
  }))

  return {
    stats: {
      totalUsers,
      totalComplaints,
      totalAnnouncements,
      totalAssignments,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      staffCount,
      residentCount,
      activeUsers: totalUsers // Assuming all users are active for now
    },
    recentActivity: {
      complaints: serializedRecentComplaints,
      users: serializedRecentUsers,
      announcements: serializedRecentAnnouncements
    },
    analyticsStats: stats
  }
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    </div>
  )
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-gray-600">Overview of your community management system</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/settings"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 inline-flex items-center space-x-2 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Residents</p>
                <p className="text-3xl font-bold text-blue-900">{data.stats.residentCount.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <Users className="w-4 h-4 text-blue-600 mr-1" />
                  <span className="text-xs text-blue-600">
                    Community residents
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 mb-1">Active Complaints</p>
                <p className="text-3xl font-bold text-yellow-900">{data.stats.pendingComplaints + data.stats.inProgressComplaints}</p>
                <div className="flex items-center mt-2">
                  <Clock className="w-4 h-4 text-yellow-600 mr-1" />
                  <span className="text-xs text-yellow-600">
                    {data.stats.pendingComplaints} pending, {data.stats.inProgressComplaints} in progress
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Resolved</p>
                <p className="text-3xl font-bold text-green-900">{data.stats.resolvedComplaints}</p>
                <div className="flex items-center mt-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">
                    {data.stats.totalComplaints > 0
                      ? `${Math.round((data.stats.resolvedComplaints / data.stats.totalComplaints) * 100)}% resolution rate`
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

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-purple-900">{data.stats.totalUsers.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <Users className="w-4 h-4 text-purple-600 mr-1" />
                  <span className="text-xs text-purple-600">
                    {data.stats.staffCount} staff, {data.stats.residentCount} residents
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
      </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="w-5 h-5 text-indigo-600 mr-2" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/users/new"
              className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-indigo-900">Add User</p>
                <p className="text-sm text-indigo-600">Create new resident/staff</p>
              </div>
            </Link>

            <Link
              href="/admin/complaints"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-blue-900">Manage Complaints</p>
                <p className="text-sm text-blue-600">View & assign tasks</p>
              </div>
            </Link>

            <Link
              href="/admin/announcements/new"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                <Bell className="w-5 h-5 text-white" />
              </div>
            <div>
                <p className="font-medium text-green-900">New Announcement</p>
                <p className="text-sm text-green-600">Broadcast to community</p>
              </div>
            </Link>

            <Link
              href="/admin/analytics"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                <p className="font-medium text-purple-900">View Analytics</p>
                <p className="text-sm text-purple-600">Detailed insights</p>
              </div>
            </Link>
                </div>
              </div>

        {/* Analytics Dashboard */}
        <Suspense fallback={<DashboardSkeleton />}>
          <AnalyticsDashboard stats={data.analyticsStats} />
        </Suspense>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Complaints */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 text-orange-600 mr-2" />
                Recent Complaints
              </h2>
              <Link
                href="/admin/complaints"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {data.recentActivity.complaints.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No complaints yet</p>
              ) : (
                data.recentActivity.complaints.map((complaint: any) => (
                  <div key={complaint._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 truncate">{complaint.title}</p>
                      <p className="text-sm text-gray-600">
                        by {complaint.submittedBy?.name || 'Unknown'} • {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {complaint.status.replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
            </div>

          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                Recent Users
              </h2>
              <Link
                href="/admin/users"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {data.recentActivity.users.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No users yet</p>
              ) : (
                data.recentActivity.users.map((user: any) => (
                  <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        user.role === 'admin' ? 'bg-purple-100' :
                        user.role === 'staff' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
              </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Bell className="w-5 h-5 text-green-600 mr-2" />
              Recent Announcements
            </h2>
            <Link
              href="/admin/announcements"
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.recentActivity.announcements.length === 0 ? (
              <p className="text-gray-500 text-center py-4 col-span-full">No announcements yet</p>
            ) : (
              data.recentActivity.announcements.map((announcement: any) => (
                <div key={announcement._id} className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-900 mb-2 line-clamp-2">{announcement.title}</h3>
                  <p className="text-sm text-green-700 line-clamp-3 mb-3">{announcement.content}</p>
                  <div className="flex items-center justify-between text-xs text-green-600">
                    <span>by {announcement.createdBy?.name || 'Admin'}</span>
                    <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                  </div>
            </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

