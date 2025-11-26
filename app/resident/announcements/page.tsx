import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'
import Navbar from '@/components/Navbar'
import { Bell, Pin, Calendar, User } from 'lucide-react'
import { IAnnouncement } from '@/types'
import Link from 'next/link'

async function getAnnouncements() {
  const session = await getServerSession(authOptions)
  if (!session) return { announcements: [] }

  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/announcements`, {
      headers: {
        Cookie: `next-auth.session-token=${session.user?.id}`,
      },
      cache: 'no-store',
    })

    if (!res.ok) return { announcements: [] }

    // Check if response is JSON
    const contentType = res.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Announcements API returned non-JSON response')
      return { announcements: [] }
    }

    const data = await res.json()
    return { announcements: data.data?.announcements || [] }
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return { announcements: [] }
  }
}

export default async function ResidentAnnouncementsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== UserRole.RESIDENT) {
    redirect('/auth/signin')
  }

  const { announcements } = await getAnnouncements()

  const pinnedAnnouncements = announcements.filter((a: IAnnouncement) => a.isPinned)
  const regularAnnouncements = announcements.filter((a: IAnnouncement) => !a.isPinned)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
              <p className="mt-2 text-gray-600">Stay updated with the latest community announcements</p>
            </div>
            <Link
              href="/resident/dashboard"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Pinned Announcements */}
        {pinnedAnnouncements.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Pin className="w-5 h-5 text-primary-600 fill-current" />
              <h2 className="text-2xl font-semibold text-gray-900">Important Announcements</h2>
            </div>
            <div className="space-y-4">
              {pinnedAnnouncements.map((announcement: IAnnouncement) => (
                <div
                  key={announcement._id}
                  className="bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-500 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Pin className="w-4 h-4 text-primary-600 fill-current" />
                        <h3 className="text-xl font-bold text-gray-900">{announcement.title}</h3>
                      </div>
                      <p className="text-gray-700 mb-4 leading-relaxed">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {announcement.createdBy && typeof announcement.createdBy === 'object' && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>By {announcement.createdBy.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        {announcement.expiresAt && (
                          <span className="text-orange-600 font-medium">
                            Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {announcement.attachments && announcement.attachments.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                          <div className="flex flex-wrap gap-2">
                            {announcement.attachments.map((attachment: string, index: number) => (
                              <a
                                key={index}
                                href={attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors"
                              >
                                <span>Attachment {index + 1}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Announcements */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-600" />
            All Announcements
          </h2>
        </div>

        <div className="space-y-4">
          {regularAnnouncements.length === 0 && pinnedAnnouncements.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No announcements at this time.</p>
              <p className="text-gray-400 text-sm mt-2">Check back later for updates from the community.</p>
            </div>
          ) : regularAnnouncements.length === 0 && pinnedAnnouncements.length > 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No additional announcements at this time.</p>
            </div>
          ) : (
            regularAnnouncements.map((announcement: IAnnouncement) => (
              <div
                key={announcement._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{announcement.title}</h3>
                    <p className="text-gray-600 mb-3 leading-relaxed">{announcement.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {announcement.createdBy && typeof announcement.createdBy === 'object' && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>By {announcement.createdBy.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      {announcement.expiresAt && (
                        <span className="text-orange-600">
                          Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {announcement.attachments && announcement.attachments.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                        <div className="flex flex-wrap gap-2">
                          {announcement.attachments.map((attachment: string, index: number) => (
                            <a
                              key={index}
                              href={attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                            >
                              <span>Attachment {index + 1}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
