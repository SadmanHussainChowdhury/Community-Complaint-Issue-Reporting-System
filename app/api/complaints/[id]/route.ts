import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Complaint from '@/models/Complaint'
import User from '@/models/User'
import ActivityLog from '@/models/ActivityLog'
import { authOptions } from '@/lib/auth-options'
import { ComplaintStatus, UserRole } from '@/types/enums'
import { ApiResponse, IComplaint } from '@/types'
import { triggerPusherEvent, CHANNELS, EVENTS } from '@/lib/pusher'
import { uploadImage } from '@/lib/cloudinary'
import { sendEmail, EmailTemplates } from '@/lib/email-service'
import { jsonResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/complaints/[id] - Get single complaint
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 401)
    }

    await connectDB()

    const complaint = await Complaint.findById(params.id)
      .populate('submittedBy', 'name email phone apartment building')
      .populate('assignedTo', 'name email')
      .populate('notes.addedBy', 'name email role')
      .lean()

    if (!complaint) {
      return jsonResponse({ success: false, error: 'Complaint not found' }, 404)
    }

    // Check access permissions
    const userRole = session.user.role
    const userId = session.user.id

    const submittedById = typeof complaint.submittedBy === 'string'
      ? complaint.submittedBy
      : complaint.submittedBy._id.toString()

    if (
      userRole === UserRole.RESIDENT &&
      submittedById !== userId
    ) {
      return jsonResponse({ success: false, error: 'Access denied' }, 403)
    }

    const assignedToId = complaint.assignedTo
      ? (typeof complaint.assignedTo === 'string'
          ? complaint.assignedTo
          : complaint.assignedTo._id.toString())
      : null

    if (
      userRole === UserRole.STAFF &&
      assignedToId !== userId
    ) {
      return jsonResponse({ success: false, error: 'Access denied' }, 403)
    }

    return jsonResponse<{ complaint: IComplaint }>({
      success: true,
      data: { complaint },
    })
  } catch (error) {
    console.error('Error fetching complaint:', error)
    return jsonResponse(
      { success: false, error: 'Failed to fetch complaint' },
      500
    )
  }
}

// PATCH /api/complaints/[id] - Update complaint
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 401)
    }

    await connectDB()

    const complaint = await Complaint.findById(params.id)
    if (!complaint) {
      return jsonResponse({ success: false, error: 'Complaint not found' }, 404)
    }

    const userRole = session.user.role

    // Handle FormData for resident updates (with images) or JSON for other updates
    let body: any
    let isFormData = false

    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      body = Object.fromEntries(formData.entries())
      isFormData = true

      // Parse JSON strings back to objects
      if (typeof body.existingImages === 'string') {
        try {
          body.existingImages = JSON.parse(body.existingImages)
        } catch (e) {
          body.existingImages = []
        }
      }
    } else {
      body = await req.json()
    }

    const updates: Record<string, unknown> = {}

    // Residents can only update their own pending complaints
    if (userRole === UserRole.RESIDENT) {
      if (complaint.submittedBy.toString() !== session.user.id) {
        return jsonResponse({ success: false, error: 'Access denied' }, 403)
      }
      if (complaint.status !== ComplaintStatus.PENDING) {
        return jsonResponse(
          { success: false, error: 'Can only update pending complaints' },
          403
        )
      }
      if (body.title) updates.title = body.title
      if (body.description) updates.description = body.description
      if (body.category) updates.category = body.category
      if (body.priority) updates.priority = body.priority

      // Handle image updates for residents
      if (isFormData) {
        const currentImages = complaint.images || []
        const existingImages = Array.isArray(body.existingImages) ? body.existingImages : []
        const newImages = body.images

        // Start with existing images that weren't removed
        let updatedImages = currentImages.filter(img => existingImages.includes(img))

        // Add new uploaded images
        if (newImages) {
          const imageFiles = Array.isArray(newImages) ? newImages : [newImages]
          for (const imageFile of imageFiles) {
            if (imageFile && typeof imageFile === 'object' && 'size' in imageFile) {
              try {
                const imageResult = await uploadImage(imageFile, 'complaints')
                updatedImages.push(imageResult.secure_url)
              } catch (uploadError) {
                console.error('Error uploading image:', uploadError)
                // Continue with other images
              }
            }
          }
        }

        updates.images = updatedImages
      }
    }

    // Staff can update assigned complaints
    if (userRole === UserRole.STAFF) {
      if (complaint.assignedTo?.toString() !== session.user.id) {
        return jsonResponse({ success: false, error: 'Access denied' }, 403)
      }
      if (body.status) updates.status = body.status
      if (body.notes) {
        updates.$push = {
          notes: {
            content: body.notes,
            addedBy: session.user.id,
            addedAt: new Date(),
            isInternal: body.isInternal || false,
          },
        }
      }
      if (body.resolutionProof) {
        // Handle resolution proof uploads
        const proofUrls: string[] = []
        // This would need to be handled via form data in a separate endpoint
        updates.resolutionProof = proofUrls
      }
      if (body.status === ComplaintStatus.RESOLVED) {
        updates.resolvedAt = new Date()
      }
    }

    // Admin can update anything
    if (userRole === UserRole.ADMIN) {
      if (body.title) updates.title = body.title
      if (body.description) updates.description = body.description
      if (body.category) updates.category = body.category
      if (body.priority) updates.priority = body.priority
      if (body.status) {
        updates.status = body.status
        if (body.status === ComplaintStatus.RESOLVED && !complaint.resolvedAt) {
          updates.resolvedAt = new Date()
        }
      }
      if (body.assignedTo !== undefined) updates.assignedTo = body.assignedTo
      if (body.notes) {
        updates.$push = {
          notes: {
            content: body.notes,
            addedBy: session.user.id,
            addedAt: new Date(),
            isInternal: body.isInternal || false,
          },
        }
      }
    }

    const previousStatus = complaint.status
    const updatedComplaint = await Complaint.findByIdAndUpdate(params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')

    if (!updatedComplaint) {
      return jsonResponse({ success: false, error: 'Complaint not found' }, 404)
    }

    // Log activity
    await ActivityLog.create({
      user: session.user.id,
      action: 'complaint_updated',
      entityType: 'complaint',
      entityId: params.id,
      details: updates,
      communityId: session.user.communityId,
    })

    // Send email notifications for status changes
    try {
      // Notify submitter of status change
      if (updates.status && updates.status !== previousStatus && updatedComplaint.submittedBy) {
        const submitter = typeof updatedComplaint.submittedBy === 'object' 
          ? updatedComplaint.submittedBy 
          : await User.findById(updatedComplaint.submittedBy).select('email name').lean()
        
        if (submitter && 'email' in submitter && submitter.email) {
          const submitterName = 'name' in submitter ? submitter.name : 'Resident'
          await sendEmail({
            to: submitter.email,
            subject: `Complaint Status Updated: ${updatedComplaint.title}`,
            template: EmailTemplates.COMPLAINT_STATUS_UPDATE,
            context: {
              residentName: submitterName,
              complaintTitle: updatedComplaint.title,
              oldStatus: previousStatus.replace(/_/g, ' ').toUpperCase(),
              newStatus: (updates.status as string).replace(/_/g, ' ').toUpperCase(),
              complaintLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/resident/complaints/${updatedComplaint._id}`,
            },
          })
        }
      }

      // Notify staff if assigned
      if (updates.assignedTo && updatedComplaint.assignedTo) {
        const staff = typeof updatedComplaint.assignedTo === 'object'
          ? updatedComplaint.assignedTo
          : await User.findById(updatedComplaint.assignedTo).select('email name').lean()
        
        if (staff && 'email' in staff && staff.email) {
          const staffName = 'name' in staff ? staff.name : 'Staff Member'
          await sendEmail({
            to: staff.email,
            subject: `New Complaint Assignment: ${updatedComplaint.title}`,
            template: EmailTemplates.COMPLAINT_ASSIGNED,
            context: {
              staffName,
              complaintTitle: updatedComplaint.title,
              complaintDescription: updatedComplaint.description,
              complaintLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/staff/complaints/${updatedComplaint._id}`,
            },
          })
        }
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError)
    }

    // Trigger real-time update
    await triggerPusherEvent(CHANNELS.complaint(params.id), EVENTS.COMPLAINT_UPDATED, {
      complaint: updatedComplaint,
    })

    return jsonResponse<{ complaint: IComplaint }>({
      success: true,
      data: { complaint: updatedComplaint },
      message: 'Complaint updated successfully',
    })
  } catch (error) {
    console.error('Error updating complaint:', error)
    return jsonResponse(
      { success: false, error: 'Failed to update complaint' },
      500
    )
  }
}

// DELETE /api/complaints/[id] - Delete complaint (Admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 401)
    }

    await connectDB()

    const complaint = await Complaint.findByIdAndDelete(params.id)
    if (!complaint) {
      return jsonResponse({ success: false, error: 'Complaint not found' }, 404)
    }

    // Log activity
    await ActivityLog.create({
      user: session.user.id,
      action: 'complaint_deleted',
      entityType: 'complaint',
      entityId: params.id,
      details: { title: complaint.title },
      communityId: session.user.communityId,
    })

    return jsonResponse({
      success: true,
      message: 'Complaint deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting complaint:', error)
    return jsonResponse(
      { success: false, error: 'Failed to delete complaint' },
      500
    )
  }
}

