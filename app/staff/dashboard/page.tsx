import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'
import Navbar from '@/components/Navbar'
import ComplaintCard from '@/components/ComplaintCard'
import StatsCard from '@/components/StatsCard'
import { ClipboardList, Clock, CheckCircle, AlertCircle, Bell, Pin } from 'lucide-react'
import { IComplaint, IAnnouncement } from '@/types'

async function getAssignedComplaints() {
  const session = await getServerSession(authOptions)
  if (!session) return { complaints: [] }

  const res = await fetch(
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/complaints?assignedTo=${session.user.id}`,
    {
      headers: {
        Cookie: `next-auth.session-token=${session.user?.id}`,
      },
      cache: 'no-store',
    }
  )

  if (!res.ok) return { complaints: [] }

  const data = await res.json()
  return { complaints: data.data?.complaints || [] }
}

async function getAnnouncements() {
  const session = await getServerSession(authOptions)
  if (!session) return { announcements: [] }

  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/announcements?limit=3`, {
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

export default async function StaffDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== UserRole.STAFF) {
    redirect('/auth/signin')
  }

  const { complaints } = await getAssignedComplaints()
  const { announcements } = await getAnnouncements()

  const pendingCount = complaints.filter((c: IComplaint) => c.status === 'pending').length
  const inProgressCount = complaints.filter((c: IComplaint) => c.status === 'in_progress').length
  const resolvedCount = complaints.filter((c: IComplaint) => c.status === 'resolved').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="mt-2 text-gray-600">View announcements and manage your assigned complaints</p>
        </div>

        {/* Announcements Section */}
        {announcements.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-6 h-6 text-primary-600" />
                Recent Announcements
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
          <StatsCard title="Total Assigned" value={complaints.length} icon="ClipboardList" color="blue" />
          <StatsCard title="Pending" value={pendingCount} icon="Clock" color="yellow" />
          <StatsCard title="In Progress" value={inProgressCount} icon="AlertCircle" color="blue" />
          <StatsCard title="Resolved" value={resolvedCount} icon="CheckCircle" color="green" />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Assigned Complaints</h2>
        </div>

        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No assigned complaints yet.</p>
            </div>
          ) : (
            complaints.map((complaint: IComplaint) => (
              <ComplaintCard key={complaint._id} complaint={complaint} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

