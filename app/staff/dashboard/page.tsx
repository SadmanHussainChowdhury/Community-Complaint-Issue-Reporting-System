import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { UserRole } from '@/types/enums'
import Navbar from '@/components/Navbar'
import ComplaintCard from '@/components/ComplaintCard'
import StatsCard from '@/components/StatsCard'
import { ClipboardList, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { IComplaint } from '@/types'

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

export default async function StaffDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== UserRole.STAFF) {
    redirect('/auth/signin')
  }

  const { complaints } = await getAssignedComplaints()

  const pendingCount = complaints.filter((c: IComplaint) => c.status === 'pending').length
  const inProgressCount = complaints.filter((c: IComplaint) => c.status === 'in_progress').length
  const resolvedCount = complaints.filter((c: IComplaint) => c.status === 'resolved').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="mt-2 text-gray-600">View and manage your assigned complaints</p>
        </div>

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

