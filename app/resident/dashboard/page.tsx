'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ComplaintCard from '@/components/ComplaintCard'
import StatsCard from '@/components/StatsCard'
import { ClipboardList, Clock, CheckCircle, AlertCircle, Bell, Pin, Loader2 } from 'lucide-react'
import { IComplaint, IAnnouncement } from '@/types'
import Link from 'next/link'

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
      const complaintsRes = await fetch('/api/complaints')
      if (complaintsRes.ok) {
        const complaintsData = await complaintsRes.json()
        setComplaints(complaintsData.data?.complaints || [])
      } else {
        setError('Failed to load complaints')
      }

      // Fetch announcements
      const announcementsRes = await fetch('/api/announcements?limit=5')
      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json()
        setAnnouncements(announcementsData.data?.announcements || [])
      } else {
        setError('Failed to load announcements')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load dashboard data')
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
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
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
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
              <p className="mt-2 text-gray-600">View announcements and manage your submitted complaints</p>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Announcements Section */}
        {announcements.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-6 h-6 text-primary-600" />
                Announcements
              </h2>
            </div>
            <div className="space-y-4">
              {announcements.map((announcement: IAnnouncement) => (
                <div
                  key={announcement._id}
                  className={`premium-card ${announcement.isPinned ? 'border-2 border-primary-500' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {announcement.isPinned && (
                          <Pin className="w-4 h-4 text-primary-600 fill-current" />
                        )}
                        <h3 className="text-lg font-bold text-gray-900">{announcement.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-3">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {announcement.createdBy && typeof announcement.createdBy === 'object' && (
                          <span>By {announcement.createdBy.name}</span>
                        )}
                        <span>
                          {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        {announcement.expiresAt && (
                          <span className="text-orange-600">
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <StatsCard title="Total Complaints" value={complaints.length} icon="ClipboardList" color="blue" />
                  <StatsCard title="Pending" value={pendingCount} icon="Clock" color="yellow" />
                  <StatsCard title="In Progress" value={inProgressCount} icon="AlertCircle" color="blue" />
                  <StatsCard title="Resolved" value={resolvedCount} icon="CheckCircle" color="green" />
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">My Complaints</h2>
          <Link
            href="/resident/complaints/new"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            + New Complaint
          </Link>
        </div>

        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No complaints yet. Submit your first complaint!</p>
            </div>
          ) : (
            complaints.map((complaint: IComplaint) => (
              <ComplaintCard key={complaint._id} complaint={complaint} showActions={true} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

