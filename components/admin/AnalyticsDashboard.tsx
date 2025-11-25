'use client'

import { DashboardStats } from '@/types'
import { BarChart3, TrendingUp, Clock, CheckCircle } from 'lucide-react'

interface AnalyticsDashboardProps {
  stats: DashboardStats | null
}

export default function AnalyticsDashboard({ stats }: AnalyticsDashboardProps) {
  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Complaints</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalComplaints}</p>
            </div>
            <BarChart3 className="w-12 h-12 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingComplaints}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgressComplaints}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolvedComplaints}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Complaints by Category</h2>
          <div className="space-y-3">
            {Object.entries(stats.complaintsByCategory).map(([category, count]) => (
              <div key={category}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 capitalize">{category.replace('_', ' ')}</span>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{
                      width: `${stats.totalComplaints > 0 ? (count / stats.totalComplaints) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Complaints by Priority</h2>
          <div className="space-y-3">
            {Object.entries(stats.complaintsByPriority).map(([priority, count]) => (
              <div key={priority}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 capitalize">{priority}</span>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{
                      width: `${stats.totalComplaints > 0 ? (count / stats.totalComplaints) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Performance */}
      {stats.staffPerformance && stats.staffPerformance.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Staff Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Staff Member</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Assigned</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Resolved</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg. Resolution Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.staffPerformance.map((staff) => (
                  <tr key={staff.staffId} className="border-b">
                    <td className="py-3 px-4">{staff.staffName}</td>
                    <td className="py-3 px-4">{staff.assignedCount}</td>
                    <td className="py-3 px-4">{staff.resolvedCount}</td>
                    <td className="py-3 px-4">{staff.averageResolutionTime} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

