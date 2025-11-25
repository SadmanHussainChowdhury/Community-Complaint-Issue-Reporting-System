import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import StatsCard from '@/components/StatsCard'
import Link from 'next/link'
import { ClipboardList, Clock, CheckCircle, Users } from 'lucide-react'
import { DashboardStats } from '@/types'

async function getDashboardStats(): Promise<DashboardStats | null> {
  const session = await getServerSession(authOptions)
  if (!session) return null

  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/dashboard`, {
      headers: {
        Cookie: `next-auth.session-token=${session.user?.id}`,
      },
      cache: 'no-store',
    })

    if (!res.ok) return null

    // Check if response is JSON
    const contentType = res.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Dashboard API returned non-JSON response')
      return null
    }

    const data = await res.json()
    return data.data?.stats || null
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return null
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 animate-fade-in">
          <h1 className="text-5xl font-extrabold mb-4">
            <span className="gradient-text">Admin Dashboard</span>
          </h1>
          <p className="text-xl text-gray-600">Comprehensive overview of all complaints and system statistics</p>
        </div>

        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatsCard
                title="Total Complaints"
                value={stats.totalComplaints}
                icon="ClipboardList"
                color="blue"
              />
              <StatsCard
                title="Pending"
                value={stats.pendingComplaints}
                icon="Clock"
                color="yellow"
              />
              <StatsCard
                title="In Progress"
                value={stats.inProgressComplaints}
                icon="Clock"
                color="blue"
              />
              <StatsCard
                title="Resolved"
                value={stats.resolvedComplaints}
                icon="CheckCircle"
                color="green"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Complaints by Category</h2>
                <div className="space-y-2">
                  {Object.entries(stats.complaintsByCategory).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">{category}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Complaints by Priority</h2>
                <div className="space-y-2">
                  {Object.entries(stats.complaintsByPriority).map(([priority, count]) => (
                    <div key={priority} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">{priority}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {stats.staffPerformance.length > 0 && (
              <div className="premium-card mb-12">
                <h2 className="text-2xl font-bold mb-6 gradient-text">Staff Performance</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Staff Member
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Assigned
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Resolved
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Avg. Resolution Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {stats.staffPerformance.map((staff, index) => (
                        <tr key={staff.staffId} className="hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold mr-3">
                                {staff.staffName.charAt(0)}
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{staff.staffName}</span>
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
                            <span className="text-sm font-semibold text-gray-700">
                              {staff.averageResolutionTime} days
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="premium-card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold gradient-text">Recent Complaints</h2>
                <Link
                  href="/admin/complaints"
                  className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {stats.recentComplaints.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No recent complaints</p>
                  </div>
                ) : (
                  stats.recentComplaints.map((complaint) => {
                    const statusColors = {
                      pending: 'bg-yellow-100 text-yellow-800',
                      in_progress: 'bg-blue-100 text-blue-800',
                      resolved: 'bg-green-100 text-green-800',
                    }
                    return (
                      <a
                        key={complaint._id}
                        href={`/admin/complaints/${complaint._id}`}
                        className="block p-5 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-bold text-gray-900 text-lg">{complaint.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[complaint.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                                {complaint.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{complaint.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="capitalize">{complaint.category.replace('_', ' ')}</span>
                              <span>•</span>
                              <span className="capitalize">{complaint.priority}</span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </a>
                    )
                  })
                )}
              </div>
            </div>
          </>
        )}
    </div>
  )
}

