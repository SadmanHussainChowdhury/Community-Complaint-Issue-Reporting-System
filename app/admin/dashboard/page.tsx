'use client'

import { useState, useEffect } from 'react'
import StatsCard from '@/components/StatsCard'
import Link from 'next/link'
import {
  ClipboardList,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  AlertTriangle,
  Activity,
  BarChart3,
  Zap,
  Target,
  Award,
  Calendar,
  UserCheck,
  Settings,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw,
  Bell,
  Search,
  Building,
  PieChart,
  Layers,
  Globe
} from 'lucide-react'
import { DashboardStats } from '@/types'

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true)
      else setLoading(true)

      const res = await fetch('/api/dashboard', {
        credentials: 'include'
      })

      if (!res.ok) {
        if (res.status === 401) {
          setError('Authentication required. Please sign in again.')
          return
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response format')
      }

      const data = await res.json()

      if (data.success) {
        setStats(data.data.stats || null)
      } else {
        setError(data.error || 'Failed to load dashboard data')
      }
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Error fetching dashboard stats:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleRefresh = () => {
    fetchStats(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-admin">
        <div className="container-fluid py-8">
          <div className="text-center">
            <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Admin Dashboard</h2>
            <p className="text-gray-600">Fetching comprehensive system analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-admin">
        <div className="container-fluid py-8">
          <div className="text-center">
            <div className="premium-card max-w-md mx-auto">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button onClick={handleRefresh} className="btn btn-primary">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-admin">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="container-fluid py-12">
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black gradient-text">Admin Dashboard</h1>
                    <p className="text-sm text-gray-500 -mt-1">Professional Community Management</p>
                  </div>
                </div>
                <p className="text-lg text-gray-600 max-w-2xl">
                  Comprehensive analytics and management tools for efficient community operations
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="btn btn-secondary"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Last updated</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid pb-12">
        {stats && (
          <>
            {/* Enhanced Stats Grid */}
            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="premium-card group cursor-pointer animate-scale-in">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Total Complaints</p>
                      <p className="text-4xl font-black text-gray-900 group-hover:scale-110 transition-transform">
                        {stats.totalComplaints}
                      </p>
                      <div className="flex items-center mt-2">
                        <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 font-medium">+12% this month</span>
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
                      <ClipboardList className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>

                <div className="premium-card group cursor-pointer animate-scale-in" style={{ animationDelay: '0.1s' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Pending</p>
                      <p className="text-4xl font-black text-gray-900 group-hover:scale-110 transition-transform">
                        {stats.pendingComplaints}
                      </p>
                      <div className="flex items-center mt-2">
                        <ArrowDownRight className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-yellow-600 font-medium">Requires attention</span>
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
                      <Clock className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>

                <div className="premium-card group cursor-pointer animate-scale-in" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">In Progress</p>
                      <p className="text-4xl font-black text-gray-900 group-hover:scale-110 transition-transform">
                        {stats.inProgressComplaints}
                      </p>
                      <div className="flex items-center mt-2">
                        <Activity className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-sm text-blue-600 font-medium">Being worked on</span>
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
                      <Activity className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>

                <div className="premium-card group cursor-pointer animate-scale-in" style={{ animationDelay: '0.3s' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Resolved</p>
                      <p className="text-4xl font-black text-gray-900 group-hover:scale-110 transition-transform">
                        {stats.resolvedComplaints}
                      </p>
                      <div className="flex items-center mt-2">
                        <Award className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 font-medium">Excellent progress</span>
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/admin/complaints" className="premium-card text-center group">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">All Complaints</h3>
                  <p className="text-sm text-gray-600">Manage all issues</p>
                </Link>

                <Link href="/admin/users" className="premium-card text-center group">
                  <div className="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">User Management</h3>
                  <p className="text-sm text-gray-600">Manage users & roles</p>
                </Link>

                <Link href="/admin/announcements" className="premium-card text-center group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Announcements</h3>
                  <p className="text-sm text-gray-600">Send notifications</p>
                </Link>

                <Link href="/admin/analytics" className="premium-card text-center group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Analytics</h3>
                  <p className="text-sm text-gray-600">View reports</p>
                </Link>
              </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Category Breakdown */}
              <div className="premium-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold gradient-text flex items-center gap-2">
                    <PieChart className="w-6 h-6" />
                    Category Breakdown
                  </h3>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="space-y-4">
                  {Object.entries(stats.complaintsByCategory).map(([category, count]) => {
                    const percentage = stats.totalComplaints > 0 ? Math.round((count / stats.totalComplaints) * 100) : 0
                    return (
                      <div key={category} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                          <span className="font-medium text-gray-900 capitalize">
                            {category.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{count}</div>
                            <div className="text-sm text-gray-500">{percentage}%</div>
                          </div>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Priority Distribution */}
              <div className="premium-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold gradient-text flex items-center gap-2">
                    <Target className="w-6 h-6" />
                    Priority Distribution
                  </h3>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Filter className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="space-y-4">
                  {Object.entries(stats.complaintsByPriority).map(([priority, count]) => {
                    const percentage = stats.totalComplaints > 0 ? Math.round((count / stats.totalComplaints) * 100) : 0
                    const priorityColors = {
                      urgent: 'from-red-500 to-pink-500',
                      high: 'from-orange-500 to-red-500',
                      medium: 'from-yellow-500 to-orange-500',
                      low: 'from-green-500 to-emerald-500'
                    }
                    return (
                      <div key={priority} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${priorityColors[priority as keyof typeof priorityColors] || 'from-gray-500 to-gray-600'}`}></div>
                          <span className="font-medium text-gray-900 capitalize">{priority}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{count}</div>
                            <div className="text-sm text-gray-500">{percentage}%</div>
                          </div>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${priorityColors[priority as keyof typeof priorityColors] || 'from-gray-500 to-gray-600'} rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Staff Performance */}
            {stats.staffPerformance.length > 0 && (
              <div className="premium-card mb-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold gradient-text flex items-center gap-2">
                    <Award className="w-6 h-6" />
                    Staff Performance
                  </h3>
                  <div className="flex items-center gap-3">
                    <button className="btn btn-outline text-sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Staff Member
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Assigned
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Resolved
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Success Rate
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Avg. Resolution
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {stats.staffPerformance.map((staff, index) => {
                        const successRate = staff.assignedCount > 0 ? Math.round((staff.resolvedCount / staff.assignedCount) * 100) : 0
                        return (
                          <tr key={staff.staffId} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold mr-4 shadow-lg">
                                  {staff.staffName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-gray-900">{staff.staffName}</div>
                                  <div className="text-xs text-gray-500">Staff Member</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
                                {staff.assignedCount}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-sm">
                                {staff.resolvedCount}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                                    style={{ width: `${successRate}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-semibold text-gray-700">{successRate}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-gray-700">
                                {staff.averageResolutionTime} days
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Complaints */}
            <div className="premium-card">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold gradient-text flex items-center gap-2">
                  <Activity className="w-6 h-6" />
                  Recent Activity
                </h3>
                <div className="flex items-center gap-3">
                  <Link href="/admin/complaints" className="btn btn-primary">
                    <ClipboardList className="w-4 h-4 mr-2" />
                    View All Complaints
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                {stats.recentComplaints.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                      <ClipboardList className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Recent Complaints</h3>
                    <p className="text-gray-600 mb-6">All caught up! No new complaints to review.</p>
                    <Link href="/admin/complaints" className="btn btn-secondary">
                      Browse All Complaints
                    </Link>
                  </div>
                ) : (
                  stats.recentComplaints.slice(0, 5).map((complaint, index) => {
                    const statusColors = {
                      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
                      resolved: 'bg-green-100 text-green-800 border-green-200',
                      cancelled: 'bg-red-100 text-red-800 border-red-200'
                    }

                    const priorityColors = {
                      urgent: 'bg-red-100 text-red-800',
                      high: 'bg-orange-100 text-orange-800',
                      medium: 'bg-yellow-100 text-yellow-800',
                      low: 'bg-green-100 text-green-800'
                    }

                    return (
                      <Link
                        key={complaint._id}
                        href={`/admin/complaints/${complaint._id}`}
                        className="block p-6 rounded-xl bg-gradient-to-r from-white to-gray-50 border border-gray-100 hover:shadow-floating hover:border-blue-200 transition-all duration-300 group animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {complaint.title}
                              </h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[complaint.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                {complaint.status.replace('_', ' ').toUpperCase()}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityColors[complaint.priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800'}`}>
                                {complaint.priority.toUpperCase()}
                              </span>
                            </div>

                            <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                              {complaint.description}
                            </p>

                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Building className="w-4 h-4" />
                                {complaint.category.replace('_', ' ')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(complaint.createdAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <UserCheck className="w-4 h-4" />
                                {typeof complaint.submittedBy === 'object' ? complaint.submittedBy.name : 'Unknown'}
                              </span>
                            </div>
                          </div>

                          <div className="ml-6 flex items-center gap-2">
                            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                          </div>
                        </div>
                      </Link>
                    )
                  })
                )}
              </div>

              {stats.recentComplaints.length > 5 && (
                <div className="mt-6 text-center">
                  <Link href="/admin/complaints" className="btn btn-outline">
                    View {stats.recentComplaints.length - 5} More Complaints
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

