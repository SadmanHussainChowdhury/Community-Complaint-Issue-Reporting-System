import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import AssignmentList from '@/components/admin/AssignmentList'

async function getAssignments() {
  const session = await getServerSession(authOptions)
  if (!session) return { assignments: [] }

  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/assignments`, {
    headers: {
      Cookie: `next-auth.session-token=${session.user?.id}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) return { assignments: [] }

  const data = await res.json()
  return { assignments: data.data?.assignments || [] }
}

export default async function AdminAssignmentsPage() {
  const { assignments } = await getAssignments()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Assignments</h1>
          <p className="mt-2 text-gray-600">Manage complaint assignments to staff members</p>
        </div>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          + New Assignment
        </button>
      </div>

      <AssignmentList assignments={assignments} />
    </div>
  )
}

