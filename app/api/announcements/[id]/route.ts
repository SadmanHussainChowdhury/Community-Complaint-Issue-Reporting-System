import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Announcement from '@/models/Announcement'
import ActivityLog from '@/models/ActivityLog'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'
import { ApiResponse, IAnnouncement } from '@/types'
import { triggerPusherEvent, CHANNELS, EVENTS } from '@/lib/pusher'
import { uploadImage } from '@/lib/cloudinary'
import { jsonResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/announcements/[id] - Get single announcement
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 401)
    }

    await connectDB()

    const announcement = await Announcement.findById(id)
      .populate('createdBy', 'name email')
      .lean()

    if (!announcement) {
      return jsonResponse({ success: false, error: 'Announcement not found' }, 404)
    }

    return jsonResponse<{ announcement: IAnnouncement }>({
      success: true,
      data: { announcement: announcement as any },
    })
  } catch (error) {
    console.error('Error fetching announcement:', error)
    return jsonResponse(
      { success: false, error: 'Failed to fetch announcement' },
      500
    )
  }
}

// PATCH /api/announcements/[id] - Update announcement (Admin only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 401)
    }

    await connectDB()

    const announcement = await Announcement.findById(id)
    if (!announcement) {
      return jsonResponse({ success: false, error: 'Announcement not found' }, 404)
    }

    const contentType = req.headers.get('content-type')
    let updateData: any = {}

    if (contentType?.includes('application/json')) {
      // JSON request (simple updates like isPinned)
      const body = await req.json()
      updateData = body
    } else {
      // FormData request (full update with attachments)
      const formData = await req.formData()
      const title = formData.get('title') as string
      const content = formData.get('content') as string
      const isPinned = formData.get('isPinned') === 'true'
      const targetRoles = formData.get('targetRoles') as string
      const expiresAt = formData.get('expiresAt') as string
      const existingAttachments = formData.get('existingAttachments') as string

      if (title) updateData.title = title
      if (content) updateData.content = content
      updateData.isPinned = isPinned
      
      if (targetRoles) {
        updateData.targetRoles = JSON.parse(targetRoles)
      }
      
      if (expiresAt) {
        updateData.expiresAt = new Date(expiresAt)
      } else if (formData.get('expiresAt') === '') {
        updateData.expiresAt = undefined
      }

      // Handle attachments
      const attachmentFiles = formData.getAll('attachments') as File[]
      const uploadedAttachments: string[] = []

      // Keep existing attachments if specified
      if (existingAttachments) {
        try {
          const existing = JSON.parse(existingAttachments)
          uploadedAttachments.push(...existing)
        } catch (e) {
          // Invalid JSON, ignore
        }
      }

      // Upload new attachments
      for (const file of attachmentFiles) {
        if (file && file.size > 0) {
          try {
            const result = await uploadImage(file, 'announcements')
            uploadedAttachments.push(result.secure_url)
          } catch (error) {
            console.error('Attachment upload error:', error)
          }
        }
      }

      if (attachmentFiles.length > 0 || existingAttachments) {
        updateData.attachments = uploadedAttachments
      }
    }

    // Update announcement
    Object.assign(announcement, updateData)
    await announcement.save()
    await announcement.populate('createdBy', 'name email')

    // Log activity
    await ActivityLog.create({
      user: session.user.id,
      action: 'announcement_updated',
      entityType: 'announcement',
      entityId: announcement._id.toString(),
      details: { title: announcement.title },
      communityId: session.user.communityId,
    })

    // Trigger real-time update
    await triggerPusherEvent(CHANNELS.community(session.user.communityId || 'default'), EVENTS.ANNOUNCEMENT_UPDATED, {
      announcement,
    })

    return jsonResponse<{ announcement: IAnnouncement }>({
      success: true,
      data: { announcement: announcement as any },
      message: 'Announcement updated successfully',
    })
  } catch (error) {
    console.error('Error updating announcement:', error)
    return jsonResponse(
      { success: false, error: 'Failed to update announcement' },
      500
    )
  }
}

// DELETE /api/announcements/[id] - Delete announcement (Admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 401)
    }

    await connectDB()

    const announcement = await Announcement.findById(id)
    if (!announcement) {
      return jsonResponse({ success: false, error: 'Announcement not found' }, 404)
    }

    await Announcement.findByIdAndDelete(id)

    // Log activity
    await ActivityLog.create({
      user: session.user.id,
      action: 'announcement_deleted',
      entityType: 'announcement',
      entityId: id,
      details: { title: announcement.title },
      communityId: session.user.communityId,
    })

    // Trigger real-time update
    await triggerPusherEvent(CHANNELS.community(session.user.communityId || 'default'), EVENTS.ANNOUNCEMENT_DELETED, {
      announcementId: id,
    })

    return jsonResponse({
      success: true,
      message: 'Announcement deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting announcement:', error)
    return jsonResponse(
      { success: false, error: 'Failed to delete announcement' },
      500
    )
  }
}

