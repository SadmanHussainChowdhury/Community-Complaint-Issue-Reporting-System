'use client'

import { useState } from 'react'
import { IAnnouncement } from '@/types'
import { Pin, Calendar, User, Trash2, Edit } from 'lucide-react'

interface AnnouncementListProps {
  announcements: IAnnouncement[]
  onAnnouncementsChange?: (announcements: IAnnouncement[]) => void
}

export default function AnnouncementList({ announcements: initialAnnouncements, onAnnouncementsChange }: AnnouncementListProps) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements)

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6">
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No announcements yet</div>
          ) : (
            announcements.map((announcement) => {
              const createdBy = typeof announcement.createdBy === 'object' ? announcement.createdBy : null

              return (
                <div
                  key={announcement._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {announcement.isPinned && (
                          <Pin className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {createdBy?.name || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                        {announcement.targetRoles && announcement.targetRoles.length > 0 && (
                          <span className="text-xs">
                            Target: {announcement.targetRoles.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button className="p-2 text-primary-600 hover:bg-primary-50 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

