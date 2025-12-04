import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import ComplaintDetail from '@/components/admin/ComplaintDetail'

async function getComplaint(id: string) {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/complaints/${id}`, {
    headers: {
      Cookie: `next-auth.session-token=${session.user?.id}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) return null

  const data = await res.json()
  return data.data?.complaint || null
}

export default async function AdminComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const complaint = await getComplaint(id)

  if (!complaint) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500">Complaint not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ComplaintDetail complaint={complaint} />
    </div>
  )
}

