import { IComplaint, IUser } from '@/types'
import { UserRole } from '@/types/enums'
import ComplaintsTable from '@/components/admin/ComplaintsTable'
import Link from 'next/link'
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

    // Convert MongoDB objects to plain objects for client component
    // Note: Next.js will automatically serialize Date objects to strings when passing to client components
    const serializedComplaints: IComplaint[] = complaints.map(c => {
      // Ensure submittedBy is never null (required field)
      let submittedBy: string | IUser
      if (c.submittedBy) {
        if (typeof c.submittedBy === 'object' && '_id' in c.submittedBy) {
          submittedBy = {
            _id: String(c.submittedBy._id),
            name: String(c.submittedBy.name || ''),
            email: String(c.submittedBy.email || ''),
            password: '',
            role: UserRole.RESIDENT,
            isActive: true,
            createdAt: new Date(0), // Fixed date for consistency
            updatedAt: new Date(0) // Fixed date for consistency
          }
        } else {
          submittedBy = String(c.submittedBy)
        }
      } else {
        // Fallback: use 'unknown' if submittedBy is missing
        submittedBy = 'unknown'
      }

      // assignedTo is optional, but if present, must not be null
      let assignedTo: string | IUser | undefined
      if (c.assignedTo) {
        if (typeof c.assignedTo === 'object' && '_id' in c.assignedTo) {
          assignedTo = {
            _id: String(c.assignedTo._id),
            name: String(c.assignedTo.name || ''),
            email: String(c.assignedTo.email || ''),
            password: '',
            role: UserRole.STAFF,
            isActive: true,
            createdAt: new Date(0), // Fixed date for consistency
            updatedAt: new Date(0) // Fixed date for consistency
          }
        } else {
          assignedTo = String(c.assignedTo)
        }
      }

      return {
        _id: String(c._id),
        title: String(c.title),
        description: String(c.description),
        category: c.category,
        priority: c.priority,
        status: c.status,
        submittedBy,
        assignedTo,
        images: Array.isArray(c.images) ? c.images.map(img => String(img)) : [],
        location: c.location,
        communityId: c.communityId ? String(c.communityId) : undefined,
        notes: Array.isArray(c.notes) ? c.notes.map(note => ({
          content: String(note.content || ''),
          addedBy: typeof note.addedBy === 'object' && '_id' in note.addedBy
            ? String(note.addedBy._id)
            : String(note.addedBy || ''),
          addedAt: note.addedAt ? new Date(note.addedAt) : new Date(),
          isInternal: Boolean(note.isInternal)
        })) : [],
        resolutionProof: Array.isArray(c.resolutionProof) ? c.resolutionProof.map(proof => String(proof)) : [],
        resolvedAt: c.resolvedAt ? new Date(c.resolvedAt) : undefined,
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date()
      } as IComplaint
    })

    console.log('Server-side: Found', serializedComplaints.length, 'complaints (page', page, 'of', Math.ceil(total / limit), ')')
    return {
      complaints: serializedComplaints,
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

    // Convert MongoDB objects to plain objects
    // Note: Next.js will automatically serialize Date objects to strings when passing to client components
    return staffMembers.map(u => ({
      _id: String(u._id),
      name: String(u.name),
      email: String(u.email),
      password: '', // Required by IUser but not used/displayed
      role: u.role,
      phone: u.phone ? String(u.phone) : undefined,
      apartment: u.apartment ? String(u.apartment) : undefined,
      building: u.building ? String(u.building) : undefined,
      communityId: u.communityId ? String(u.communityId) : undefined,
      isActive: u.isActive !== false,
      createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
      updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date()
    }))
    } catch (error) {
    console.error('Error fetching staff members:', error)
    return []
    }
  }

export default async function AdminComplaintsPage() {
  const complaintsData = await getComplaints(1, 10)
  const staffMembers = await getStaffMembers()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
              <div>
          <h1 className="text-3xl font-bold text-gray-900">Complaint Management</h1>
          <p className="mt-2 text-gray-600">Manage and track community complaints</p>
                  </div>
                            </div>

      <ComplaintsTable
        initialComplaints={complaintsData.complaints}
        initialStaff={staffMembers}
        initialTotal={complaintsData.total}
        initialPage={complaintsData.page}
        initialLimit={complaintsData.limit}
      />
    </div>
  )
}

