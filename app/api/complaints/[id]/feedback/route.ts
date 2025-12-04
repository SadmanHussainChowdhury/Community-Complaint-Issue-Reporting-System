import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Complaint from '@/models/Complaint'
import User from '@/models/User'
import ActivityLog from '@/models/ActivityLog'
import { authOptions } from '@/lib/auth-options'
import { ComplaintStatus, UserRole } from '@/types/enums'
import { ApiResponse } from '@/types'

// POST /api/complaints/[id]/feedback - Submit feedback and rating for resolved complaint
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const complaint = await Complaint.findById(id)
    if (!complaint) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Complaint not found' }, { status: 404 })
    }

    // Only the submitter can provide feedback
    if (complaint.submittedBy.toString() !== session.user.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Access denied' }, { status: 403 })
    }

    // Only resolved complaints can be rated
    if (complaint.status !== ComplaintStatus.RESOLVED) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Can only provide feedback for resolved complaints' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { rating, comment } = body

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    complaint.feedback = {
      rating,
      comment: comment || '',
      submittedAt: new Date(),
    }

    await complaint.save()

    // Log activity
    await ActivityLog.create({
      user: session.user.id,
      action: 'complaint_feedback_submitted',
      entityType: 'complaint',
      entityId: id,
      details: { rating, hasComment: !!comment },
      communityId: session.user.communityId,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Feedback submitted successfully',
    })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

