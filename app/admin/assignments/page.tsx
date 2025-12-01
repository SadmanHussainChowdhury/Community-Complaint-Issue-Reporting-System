import AssignmentsTable from '@/components/admin/AssignmentsTable'
import Link from 'next/link'
import connectDB from '@/lib/mongodb'
import Assignment from '@/models/Assignment'
import { IAssignment } from '@/types'

export const dynamic = 'force-dynamic'

async function getAssignments(page: number = 1, limit: number = 10): Promise<{ assignments: IAssignment[]; total: number; page: number; limit: number }> {
  try {
    await connectDB()

    const skip = (page - 1) * limit
    const total = await Assignment.countDocuments({})

    const assignments = await Assignment.find({})
      .populate('complaint')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ assignedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    console.log('Server-side: Found', assignments.length, 'assignments (page', page, 'of', Math.ceil(total / limit), ')')
    return {
      assignments: assignments as IAssignment[],
      total,
      page,
      limit
    }
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return {
      assignments: [],
      total: 0,
      page,
      limit
    }
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

