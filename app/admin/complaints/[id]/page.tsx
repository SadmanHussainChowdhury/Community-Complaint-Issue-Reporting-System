import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import Complaint from '@/models/Complaint'
import { UserRole } from '@/types/enums'
import { IComplaint, IUser } from '@/types'
import ComplaintDetail from '@/components/admin/ComplaintDetail'

export const dynamic = 'force-dynamic'

async function getComplaint(id: string): Promise<IComplaint | null> {
  try {
    await connectDB()

    const complaint = await Complaint.findById(id)
      .populate('submittedBy', 'name email phone apartment building')
      .populate('assignedTo', 'name email')
      .populate('notes.addedBy', 'name email role')
      .lean()

    if (!complaint) return null

    // Serialize MongoDB object to plain object
    const submittedBy: string | IUser = complaint.submittedBy
      ? (typeof complaint.submittedBy === 'object' && '_id' in complaint.submittedBy
          ? {
              _id: String(complaint.submittedBy._id),
              name: String(complaint.submittedBy.name || ''),
              email: String(complaint.submittedBy.email || ''),
              password: '',
              role: UserRole.RESIDENT,
              isActive: true,
              createdAt: new Date(0),
              updatedAt: new Date(0)
            }
          : String(complaint.submittedBy))
      : 'unknown'

    const assignedTo: string | IUser | undefined = complaint.assignedTo
      ? (typeof complaint.assignedTo === 'object' && '_id' in complaint.assignedTo
          ? {
              _id: String(complaint.assignedTo._id),
              name: String(complaint.assignedTo.name || ''),
              email: String(complaint.assignedTo.email || ''),
              password: '',
              role: UserRole.STAFF,
              isActive: true,
              createdAt: new Date(0),
              updatedAt: new Date(0)
            }
          : String(complaint.assignedTo))
      : undefined

    return {
      _id: String(complaint._id),
      title: String(complaint.title),
      description: String(complaint.description),
      category: complaint.category,
      priority: complaint.priority,
      status: complaint.status,
      submittedBy,
      assignedTo,
      images: Array.isArray(complaint.images) ? complaint.images.map(img => String(img)) : [],
      location: complaint.location,
      communityId: complaint.communityId ? String(complaint.communityId) : undefined,
      notes: Array.isArray(complaint.notes) ? complaint.notes.map(note => ({
        content: String(note.content || ''),
        addedBy: typeof note.addedBy === 'object' && '_id' in note.addedBy
          ? String(note.addedBy._id)
          : String(note.addedBy || ''),
        addedAt: note.addedAt ? new Date(note.addedAt) : new Date(),
        isInternal: Boolean(note.isInternal)
      })) : [],
      resolutionProof: Array.isArray(complaint.resolutionProof) ? complaint.resolutionProof.map(proof => String(proof)) : [],
      resolvedAt: complaint.resolvedAt ? new Date(complaint.resolvedAt) : undefined,
      createdAt: complaint.createdAt ? new Date(complaint.createdAt) : new Date(),
      updatedAt: complaint.updatedAt ? new Date(complaint.updatedAt) : new Date()
    } as IComplaint
  } catch (error) {
    console.error('Error fetching complaint:', error)
    return null
  }
}

export default async function AdminComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect('/admin/dashboard')
  }

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

