import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { UserRole } from '@/types/enums'
import ComplaintList from '@/components/admin/ComplaintList'

async function getComplaints() {
  const session = await getServerSession(authOptions)
  if (!session) return { complaints: [] }

  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/complaints`, {
    headers: {
      Cookie: `next-auth.session-token=${session.user?.id}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) return { complaints: [] }

  const data = await res.json()
  return { complaints: data.data?.complaints || [] }
}

export default async function AdminComplaintsPage() {
  const { complaints } = await getComplaints()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Complaints</h1>
        <p className="mt-2 text-gray-600">Manage and track all community complaints</p>
      </div>

      <ComplaintList complaints={complaints} showActions={true} />
    </div>
  )
}

