import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Announcement from '@/models/Announcement'
import ActivityLog from '@/models/ActivityLog'
import { authOptions } from '../auth/[...nextauth]/route'
import { UserRole } from '@/types/enums'
import { ApiResponse, IAnnouncement } from '@/types'
import { triggerPusherEvent, CHANNELS, EVENTS } from '@/lib/pusher'
import { uploadImage } from '@/lib/cloudinary'
import { jsonResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/announcements - Get all announcements
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
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

    await connectDB()

    const { searchParams } = new URL(req.url)
    const isPinned = searchParams.get('isPinned')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query: Record<string, unknown> = {
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    }

    if (isPinned === 'true') {
      query.isPinned = true
    }

    // Filter by target roles if specified
    if (session.user.role) {
      query.$or = [
        { targetRoles: { $in: [session.user.role] } },
        { targetRoles: { $size: 0 } }, // No target roles means visible to all
      ]
    }

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name email')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit)
      .lean()

    return jsonResponse<{ announcements: IAnnouncement[] }>({
      success: true,
      data: { announcements },
    })
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return jsonResponse(
      { success: false, error: 'Failed to fetch announcements' },
      500
    )
  }
}

// POST /api/announcements - Create announcement (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 401)
    }

    await connectDB()

    const formData = await req.formData()
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const isPinned = formData.get('isPinned') === 'true'
    const targetRoles = formData.get('targetRoles') as string
    const expiresAt = formData.get('expiresAt') as string

    if (!title || !content) {
      return jsonResponse({ success: false, error: 'Missing required fields' }, 400)
    }

    // Upload attachments if provided
    const attachmentFiles = formData.getAll('attachments') as File[]
    const uploadedAttachments: string[] = []

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

    const announcement = await Announcement.create({
      title,
      content,
      createdBy: session.user.id,
      communityId: session.user.communityId,
      attachments: uploadedAttachments,
      isPinned,
      targetRoles: targetRoles ? JSON.parse(targetRoles) : [],
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    })

    await announcement.populate('createdBy', 'name email')

    // Log activity
    await ActivityLog.create({
      user: session.user.id,
      action: 'announcement_created',
      entityType: 'announcement',
      entityId: announcement._id.toString(),
      details: { title },
      communityId: session.user.communityId,
    })

    // Trigger real-time update
    await triggerPusherEvent(CHANNELS.community(session.user.communityId || 'default'), EVENTS.ANNOUNCEMENT_CREATED, {
      announcement,
    })

    return jsonResponse<{ announcement: IAnnouncement }>({
      success: true,
      data: { announcement },
      message: 'Announcement created successfully',
    }, 201)
  } catch (error) {
    console.error('Error creating announcement:', error)
    return jsonResponse(
      { success: false, error: 'Failed to create announcement' },
      500
    )
  }
}

