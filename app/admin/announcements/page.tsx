import AnnouncementsTable from '@/components/admin/AnnouncementsTable'
import Link from 'next/link'
import connectDB from '@/lib/mongodb'
import Announcement from '@/models/Announcement'
import { IAnnouncement, IUser } from '@/types'
import { UserRole } from '@/types/enums'

export const dynamic = 'force-dynamic'

async function getAnnouncements(page: number = 1, limit: number = 10): Promise<{ announcements: IAnnouncement[]; total: number; page: number; limit: number }> {
  try {
    await connectDB()

    const skip = (page - 1) * limit
    const total = await Announcement.countDocuments({})

    const announcements = await Announcement.find({})
      .populate('createdBy', 'name email')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Convert MongoDB objects to plain objects for client component
    // Note: Next.js will automatically serialize Date objects to strings when passing to client components
    const serializedAnnouncements: IAnnouncement[] = announcements.map(a => {
      // Ensure createdBy is never null - use fallback if missing
      let createdBy: string | IUser
      
      if (a.createdBy) {
        if (typeof a.createdBy === 'object' && '_id' in a.createdBy) {
          createdBy = {
            _id: String(a.createdBy._id),
            name: String(a.createdBy.name || ''),
            email: String(a.createdBy.email || ''),
            password: '', // Required by IUser but not used
            role: UserRole.ADMIN, // Default role
            isActive: true,
            createdAt: new Date(0), // Fixed date for consistency
            updatedAt: new Date(0) // Fixed date for consistency
          }
        } else {
          createdBy = String(a.createdBy)
        }
      } else {
        // Fallback: use string ID if createdBy is missing
        createdBy = 'unknown'
      }

      return {
        _id: String(a._id),
        title: String(a.title),
        content: String(a.content),
        createdBy,
        attachments: Array.isArray(a.attachments) ? a.attachments.map(att => String(att)) : [],
        isPinned: Boolean(a.isPinned),
        targetRoles: Array.isArray(a.targetRoles) ? (a.targetRoles as UserRole[]) : undefined,
        expiresAt: a.expiresAt ? new Date(a.expiresAt) : undefined,
        createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
        updatedAt: a.updatedAt ? new Date(a.updatedAt) : new Date(),
        communityId: a.communityId ? String(a.communityId) : undefined
      }
    })

    console.log('Server-side: Found', serializedAnnouncements.length, 'announcements (page', page, 'of', Math.ceil(total / limit), ')')
    return {
      announcements: serializedAnnouncements,
      total,
      page,
      limit
    }
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return {
      announcements: [],
      total: 0,
      page,
      limit
    }
  }
}

export default async function AdminAnnouncementsPage() {
  const announcementsData = await getAnnouncements(1, 10)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcement Management</h1>
          <p className="mt-2 text-gray-600">Manage community announcements and notices</p>
        </div>
        <Link
          href="/admin/announcements/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 inline-flex items-center space-x-2"
        >
          <span>+</span>
          <span>New Announcement</span>
        </Link>
      </div>

      <AnnouncementsTable
        initialAnnouncements={announcementsData.announcements}
        initialTotal={announcementsData.total}
        initialPage={announcementsData.page}
        initialLimit={announcementsData.limit}
      />
    </div>
  )
}

