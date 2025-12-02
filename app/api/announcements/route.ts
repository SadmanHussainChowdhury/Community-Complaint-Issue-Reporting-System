import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Announcement from '@/models/Announcement'
import User from '@/models/User'
import ActivityLog from '@/models/ActivityLog'
import { authOptions } from '@/lib/auth-options'
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
    const search = searchParams.get('search')
    const isPinned = searchParams.get('isPinned')
    const targetRole = searchParams.get('targetRole')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    let query: Record<string, unknown> = {}

    // Base query for non-expired announcements
    const expirationQuery = {
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    }

    // Search functionality
    if (search) {
      const searchConditions: Record<string, unknown>[] = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]

      // Also search in createdBy user data
      const userQuery = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id')

      const userIds = userQuery.map((user: any) => user._id)
      if (userIds.length > 0) {
        searchConditions.push({ createdBy: { $in: userIds } })
      }

      query.$or = searchConditions
    }

    // Additional filters
    if (isPinned === 'true') {
      query.isPinned = true
    } else if (isPinned === 'false') {
      query.isPinned = false
    }

    if (targetRole && targetRole !== 'all') {
      query.targetRoles = { $in: [targetRole] }
    }

    // Filter by target roles if specified (for non-admin users)
    if (session?.user?.role) {
      console.log('🔍 Filtering announcements for role:', session.user.role)

      const roleFilter = {
        $or: [
          { targetRoles: { $in: [session.user.role] } },
          { targetRoles: { $size: 0 } }, // No target roles means visible to all
        ]
      }

      if (query.$and && Array.isArray(query.$and)) {
        query.$and.push(expirationQuery, roleFilter)
      } else {
        query.$and = [expirationQuery, roleFilter]
      }

      console.log('📋 Final query:', JSON.stringify(query, null, 2))
    } else {
      // If no session/role, just use expiration filtering
      if (query.$and && Array.isArray(query.$and)) {
        query.$and.push(expirationQuery)
      } else {
        query.$and = [expirationQuery]
      }
      console.log('⚠️ No user role found, using expiration filtering only')
    }

    const total = await Announcement.countDocuments(query)

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name email')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    console.log(`📊 Found ${announcements.length} announcements for role: ${session?.user?.role}`)
    if (announcements.length > 0) {
      console.log('📋 Sample announcement:', {
        title: announcements[0].title,
        targetRoles: announcements[0].targetRoles,
        createdAt: announcements[0].createdAt
      })
    }

    return jsonResponse<{ announcements: IAnnouncement[]; total: number; page: number; limit: number }>({
      success: true,
      data: {
        announcements,
        total,
        page,
        limit
      },
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

    const parsedTargetRoles = targetRoles ? JSON.parse(targetRoles) : []
    console.log('📝 Creating announcement with target roles:', parsedTargetRoles)

    const announcement = await Announcement.create({
      title,
      content,
      createdBy: session.user.id,
      communityId: session.user.communityId,
      attachments: uploadedAttachments,
      isPinned,
      targetRoles: parsedTargetRoles,
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

