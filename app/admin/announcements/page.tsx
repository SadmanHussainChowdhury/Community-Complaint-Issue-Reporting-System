import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import AnnouncementList from '@/components/admin/AnnouncementList'

async function getAnnouncements() {
  const session = await getServerSession(authOptions)
  if (!session) return { announcements: [] }

  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/announcements`, {
    headers: {
      Cookie: `next-auth.session-token=${session.user?.id}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) return { announcements: [] }

  const data = await res.json()
  return { announcements: data.data?.announcements || [] }
}

export default async function AdminAnnouncementsPage() {
  const { announcements } = await getAnnouncements()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="mt-2 text-gray-600">Manage community announcements and notices</p>
        </div>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          + New Announcement
        </button>
      </div>

      <AnnouncementList announcements={announcements} />
    </div>
  )
}

