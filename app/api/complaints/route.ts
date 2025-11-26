import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Complaint from '@/models/Complaint'
import User from '@/models/User'
import ActivityLog from '@/models/ActivityLog'
import { authOptions } from '@/lib/auth-options'
import { ComplaintStatus, ComplaintPriority, ComplaintCategory, UserRole } from '@/types/enums'
import { ApiResponse, IComplaint } from '@/types'
import { triggerPusherEvent, CHANNELS, EVENTS } from '@/lib/pusher'
import { uploadImage } from '@/lib/cloudinary'
import { sendEmail, EmailTemplates } from '@/lib/email-service'
import { jsonResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/complaints - Get all complaints (filtered by role)
export async function GET(req: NextRequest) {
  try {
    let session = await getServerSession(authOptions)

    // Handle server-side API calls with custom headers
    if (!session?.user) {
      const userId = req.headers.get('x-user-id')
      const userRole = req.headers.get('x-user-role')

      if (userId && userRole) {
        session = {
          user: {
            id: userId,
            role: userRole as UserRole,
          }
        } as any
      } else {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Unauthorized' },
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    const assignedTo = searchParams.get('assignedTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const userRole = session.user.role
    const userId = session.user.id

    let query: Record<string, unknown> = {}

    // Role-based filtering
    if (userRole === UserRole.RESIDENT) {
      query.submittedBy = userId
    } else if (userRole === UserRole.STAFF) {
      query.assignedTo = userId
    }

    // Additional filters
    if (status) query.status = status
    if (priority) query.priority = priority
    if (category) query.category = category
    if (assignedTo) query.assignedTo = assignedTo

    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Complaint.countDocuments(query)

    return jsonResponse<{ complaints: IComplaint[]; total: number; page: number }>({
      success: true,
      data: {
        complaints,
        total,
        page,
      },
    })
  } catch (error) {
    console.error('Error fetching complaints:', error)
    return jsonResponse(
      { success: false, error: 'Failed to fetch complaints' },
      500
    )
  }
}

// POST /api/complaints - Create a new complaint
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 401)
    }

    await connectDB()

    const formData = await req.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as ComplaintCategory
    const priority = formData.get('priority') as ComplaintPriority
    const building = formData.get('building') as string
    const floor = formData.get('floor') as string
    const room = formData.get('room') as string

    if (!title || !description || !category) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Upload images if provided
    const imageFiles = formData.getAll('images') as File[]
    const uploadedImages: string[] = []

    for (const file of imageFiles) {
      if (file && file.size > 0) {
        try {
          const result = await uploadImage(file, 'complaints')
          uploadedImages.push(result.secure_url)
        } catch (error) {
          console.error('Image upload error:', error)
        }
      }
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority: priority || ComplaintPriority.MEDIUM,
      status: ComplaintStatus.PENDING,
      submittedBy: session.user.id,
      images: uploadedImages,
      location: building || floor || room ? { building, floor, room } : undefined,
      communityId: session.user.communityId,
    })

    await complaint.populate('submittedBy', 'name email')

    // Log activity
    await ActivityLog.create({
      user: session.user.id,
      action: 'complaint_created',
      entityType: 'complaint',
      entityId: complaint._id.toString(),
      details: { title, category, priority },
      communityId: session.user.communityId,
    })

    // Trigger real-time update
    await triggerPusherEvent(CHANNELS.community(session.user.communityId || 'default'), EVENTS.COMPLAINT_CREATED, {
      complaint,
    })

    // Send email notification to admins
    try {
      const submitter = await User.findById(session.user.id).select('email name').lean()
      if (submitter?.email) {
        await sendEmail({
          to: process.env.ADMIN_EMAIL_RECIPIENT || 'admin@example.com',
          subject: `New Complaint Submitted: ${complaint.title}`,
          template: EmailTemplates.NEW_COMPLAINT_ADMIN,
          context: {
            complaintTitle: complaint.title,
            complaintDescription: complaint.description,
            complaintCategory: complaint.category,
            complaintPriority: complaint.priority,
            submittedBy: submitter.name || 'Resident',
            submittedByEmail: submitter.email,
            complaintLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/complaints/${complaint._id}`,
          },
        })
      }
    } catch (error) {
      console.error('Email notification error:', error)
    }

    return jsonResponse<{ complaint: IComplaint }>(
      {
        success: true,
        data: { complaint },
        message: 'Complaint submitted successfully',
      },
      201
    )
  } catch (error) {
    console.error('Error creating complaint:', error)
    return jsonResponse(
      { success: false, error: 'Failed to create complaint' },
      500
    )
  }
}

