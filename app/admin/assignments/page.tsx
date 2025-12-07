import AssignmentsTable from '@/components/admin/AssignmentsTable'
import Link from 'next/link'
import connectDB from '@/lib/mongodb'
import Assignment from '@/models/Assignment'
import { IAssignment, IComplaint, IUser } from '@/types'
import { ComplaintStatus, ComplaintCategory, ComplaintPriority, UserRole } from '@/types/enums'

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

    // Convert MongoDB objects to plain objects for client component
    // Note: Next.js will automatically serialize Date objects to strings when passing to client components
    const serializedAssignments: IAssignment[] = assignments.map(a => {
      // Ensure complaint is never null
      let complaint: string | IComplaint
      if (a.complaint) {
        if (typeof a.complaint === 'object' && '_id' in a.complaint) {
          complaint = {
            _id: String(a.complaint._id),
            title: String(a.complaint.title || ''),
            description: String(a.complaint.description || ''),
            category: a.complaint.category || ComplaintCategory.OTHER,
            priority: a.complaint.priority || ComplaintPriority.MEDIUM,
            status: a.complaint.status || ComplaintStatus.PENDING,
            submittedBy: typeof a.complaint.submittedBy === 'object' && '_id' in a.complaint.submittedBy
              ? String(a.complaint.submittedBy._id)
              : String(a.complaint.submittedBy || ''),
            images: Array.isArray(a.complaint.images) ? a.complaint.images.map(img => String(img)) : [],
            notes: [],
            createdAt: a.complaint.createdAt ? new Date(a.complaint.createdAt) : new Date(),
            updatedAt: a.complaint.updatedAt ? new Date(a.complaint.updatedAt) : new Date()
          }
        } else {
          complaint = String(a.complaint)
        }
      } else {
        // Fallback: use empty string if complaint is missing
        complaint = ''
      }

      // Ensure assignedTo is never null
      let assignedTo: string | IUser
      if (a.assignedTo) {
        if (typeof a.assignedTo === 'object' && '_id' in a.assignedTo) {
          assignedTo = {
            _id: String(a.assignedTo._id),
            name: String(a.assignedTo.name || ''),
            email: String(a.assignedTo.email || ''),
            password: '',
            role: UserRole.STAFF,
            isActive: true,
            createdAt: new Date(0), // Fixed date for consistency
            updatedAt: new Date(0) // Fixed date for consistency
          }
        } else {
          assignedTo = String(a.assignedTo)
        }
      } else {
        assignedTo = 'unknown'
      }

      // Ensure assignedBy is never null
      let assignedBy: string | IUser
      if (a.assignedBy) {
        if (typeof a.assignedBy === 'object' && '_id' in a.assignedBy) {
          assignedBy = {
            _id: String(a.assignedBy._id),
            name: String(a.assignedBy.name || ''),
            email: String(a.assignedBy.email || ''),
            password: '',
            role: UserRole.ADMIN,
            isActive: true,
            createdAt: new Date(0), // Fixed date for consistency
            updatedAt: new Date(0) // Fixed date for consistency
          }
        } else {
          assignedBy = String(a.assignedBy)
        }
      } else {
        assignedBy = 'unknown'
      }

      return {
        _id: String(a._id),
        complaint,
        assignedTo,
        assignedBy,
        assignedAt: a.assignedAt ? new Date(a.assignedAt) : new Date(),
        dueDate: a.dueDate ? new Date(a.dueDate) : undefined,
        status: a.status || 'active',
        notes: a.notes ? String(a.notes) : undefined
      }
    })

    return {
      assignments: serializedAssignments,
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
          <h1 className="text-3xl font-bold text-gray-900">Assignment Management</h1>
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

