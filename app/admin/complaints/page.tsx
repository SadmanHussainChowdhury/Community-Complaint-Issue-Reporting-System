import { IComplaint, IUser } from '@/types'
import { UserRole } from '@/types/enums'
import ComplaintsTable from '@/components/admin/ComplaintsTable'
import connectDB from '@/lib/mongodb'
import Complaint from '@/models/Complaint'
import User from '@/models/User'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getComplaints(page: number = 1, limit: number = 10): Promise<{ complaints: IComplaint[]; total: number; page: number; limit: number }> {
    try {
    await connectDB()

    const skip = (page - 1) * limit
    const total = await Complaint.countDocuments({})

    const complaints = await Complaint.find({})
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    console.log('Server-side: Found', complaints.length, 'complaints (page', page, 'of', Math.ceil(total / limit), ')')
    return {
      complaints: complaints as IComplaint[],
      total,
      page,
      limit
      }
    } catch (error) {
    console.error('Error fetching complaints:', error)
    return {
      complaints: [],
      total: 0,
      page,
      limit
    }
  }
}

async function getStaffMembers(): Promise<IUser[]> {
  try {
    await connectDB()

    const staffMembers = await User.find({ role: UserRole.STAFF })
      .select('name email')
      .lean()

    return staffMembers as IUser[]
    } catch (error) {
    console.error('Error fetching staff members:', error)
    return []
    }
  }

export default async function AdminComplaintsPage() {
  const complaintsData = await getComplaints(1, 10)
  const staffMembers = await getStaffMembers()

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ComplaintsTable
          initialComplaints={complaintsData.complaints}
          initialStaff={staffMembers}
          initialTotal={complaintsData.total}
          initialPage={complaintsData.page}
          initialLimit={complaintsData.limit}
        />
      </div>
    </div>
  )
}

