import AnnouncementsTable from '@/components/admin/AnnouncementsTable'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getAnnouncements(page: number = 1, limit: number = 10) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/announcements?page=${page}&limit=${limit}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      console.error('Failed to fetch announcements')
      return { announcements: [], total: 0, page, limit }
    }

    const data = await res.json()
    return {
      announcements: data.data.announcements || [],
      total: data.data.total || 0,
      page: data.data.page || page,
      limit: data.data.limit || limit
    }
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return { announcements: [], total: 0, page, limit }
  }
}

export default async function AdminAnnouncementsPage() {
  const announcementsData = await getAnnouncements(1, 10)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
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

