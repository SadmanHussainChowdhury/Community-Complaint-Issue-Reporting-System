import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Assignment from '@/models/Assignment'
import Complaint from '@/models/Complaint'
import ActivityLog from '@/models/ActivityLog'
import { authOptions } from '../auth/[...nextauth]/route'
import { UserRole, ComplaintStatus } from '@/types/enums'
import { ApiResponse, IAssignment } from '@/types'
import { triggerPusherEvent, CHANNELS, EVENTS } from '@/lib/pusher'
import User from '@/models/User'
import { sendEmail, EmailTemplates } from '@/lib/email-service'

// GET /api/assignments - Get all assignments
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assignedTo')

    let query: Record<string, unknown> = {}

    // Staff can only see their own assignments
    if (session.user.role === UserRole.STAFF) {
      query.assignedTo = session.user.id
    } else if (assignedTo) {
      query.assignedTo = assignedTo
    }

    if (status) query.status = status

    const assignments = await Assignment.find(query)
      .populate('complaint')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ assignedAt: -1 })
      .lean()

    return NextResponse.json<ApiResponse<{ assignments: IAssignment[] }>>({
      success: true,
      data: { assignments },
    })
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}

// POST /api/assignments - Create new assignment (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const { complaintId, assignedTo, dueDate, notes } = body

    if (!complaintId || !assignedTo) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if complaint exists
    const complaint = await Complaint.findById(complaintId)
    if (!complaint) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Complaint not found' }, { status: 404 })
    }

    // Create assignment
    const assignment = await Assignment.create({
      complaint: complaintId,
      assignedTo,
      assignedBy: session.user.id,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes,
      status: 'active',
    })

    // Update complaint
    await Complaint.findByIdAndUpdate(complaintId, {
      assignedTo,
      status: ComplaintStatus.IN_PROGRESS,
    })

    await assignment.populate('complaint')
    await assignment.populate('assignedTo', 'name email')
    await assignment.populate('assignedBy', 'name email')

    // Log activity
    await ActivityLog.create({
      user: session.user.id,
      action: 'assignment_created',
      entityType: 'assignment',
      entityId: assignment._id.toString(),
      details: { complaintId, assignedTo },
      communityId: session.user.communityId,
    })

    // Trigger real-time update
    await triggerPusherEvent(CHANNELS.complaint(complaintId), EVENTS.COMPLAINT_ASSIGNED, {
      assignment,
      complaint,
    })

    // Send email notification to assigned staff
    try {
      const staff = await User.findById(assignedTo).select('email name').lean()
      
      if (staff?.email) {
        await sendEmail({
          to: staff.email,
          subject: `New Complaint Assignment: ${complaint.title}`,
          template: EmailTemplates.COMPLAINT_ASSIGNED,
          context: {
            staffName: staff.name || 'Staff Member',
            complaintTitle: complaint.title,
            complaintDescription: complaint.description,
            complaintLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/staff/complaints/${complaint._id}`,
          },
        })
      }
    } catch (error) {
      console.error('Email notification error:', error)
    }

    return NextResponse.json<ApiResponse<{ assignment: IAssignment }>>(
      {
        success: true,
        data: { assignment },
        message: 'Assignment created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create assignment' },
      { status: 500 }
    )
  }
}

