import AssignmentsTable from '@/components/admin/AssignmentsTable'
import Link from 'next/link'

async function getAssignments(page: number = 1, limit: number = 10) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/assignments?page=${page}&limit=${limit}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      console.error('Failed to fetch assignments')
      return { assignments: [], total: 0, page, limit }
    }

    const data = await res.json()
    return {
      assignments: data.data.assignments || [],
      total: data.data.total || 0,
      page: data.data.page || page,
      limit: data.data.limit || limit
    }
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return { assignments: [], total: 0, page, limit }
  }
}

export default async function AdminAssignmentsPage() {
  const assignmentsData = await getAssignments(1, 10)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Assignments</h1>
          <p className="mt-2 text-gray-600">Manage complaint assignments to staff members</p>
        </div>
        <Link
          href="/admin/assignments/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 inline-flex items-center space-x-2"
        >
          <span>+</span>
          <span>New Assignment</span>
        </Link>
      </div>

      <AssignmentsTable
        initialAssignments={assignmentsData.assignments}
        initialTotal={assignmentsData.total}
        initialPage={assignmentsData.page}
        initialLimit={assignmentsData.limit}
      />
    </div>
  )
}

