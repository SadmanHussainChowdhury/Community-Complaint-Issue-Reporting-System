import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'
import Navbar from '@/components/Navbar'
import ComplaintCard from '@/components/ComplaintCard'
import StatsCard from '@/components/StatsCard'
import { ClipboardList, Clock, CheckCircle, AlertCircle, Bell, Pin } from 'lucide-react'
import { IComplaint, IAnnouncement } from '@/types'
import Link from 'next/link'

async function getComplaints() {
  const session = await getServerSession(authOptions)
  if (!session) return { complaints: [], stats: null }

  try {
  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/complaints`, {
    headers: {
      Cookie: `next-auth.session-token=${session.user?.id}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) return { complaints: [], stats: null }

    // Check if response is JSON
    const contentType = res.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Complaints API returned non-JSON response')
      return { complaints: [], stats: null }
    }

  const data = await res.json()
  return { complaints: data.data?.complaints || [], stats: data.data?.stats || null }
  } catch (error) {
    console.error('Error fetching complaints:', error)
    return { complaints: [], stats: null }
  }
}

async function getAnnouncements() {
  const session = await getServerSession(authOptions)
  if (!session) return { announcements: [] }

  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/announcements?limit=5`, {
      headers: {
        Cookie: `next-auth.session-token=${session.user?.id}`,
      },
      cache: 'no-store',
    })

    if (!res.ok) return { announcements: [] }

    // Check if response is JSON
    const contentType = res.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Announcements API returned non-JSON response')
      return { announcements: [] }
    }

    const data = await res.json()
    return { announcements: data.data?.announcements || [] }
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return { announcements: [] }
  }
}

export default async function ResidentDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== UserRole.RESIDENT) {
    redirect('/auth/signin')
  }

  const { complaints, stats } = await getComplaints()
  const { announcements } = await getAnnouncements()

  const pendingCount = complaints.filter((c: IComplaint) => c.status === 'pending').length
  const inProgressCount = complaints.filter((c: IComplaint) => c.status === 'in_progress').length
  const resolvedCount = complaints.filter((c: IComplaint) => c.status === 'resolved').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="mt-2 text-gray-600">View announcements and manage your submitted complaints</p>
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

