'use client'

import { useState } from 'react'
import { IAnnouncement } from '@/types'
import { UserRole } from '@/types/enums'
import { Pin, Calendar, User, Trash2, Edit } from 'lucide-react'
import toast from 'react-hot-toast'

interface AnnouncementListProps {
  announcements: IAnnouncement[]
  onAnnouncementsChange?: (announcements: IAnnouncement[]) => void
  onAnnouncementSelect?: (announcementId: string, selected: boolean) => void
  onSelectAllAnnouncements?: (selected: boolean) => void
  selectedAnnouncements?: string[]
  loading?: boolean
}

const roleColors = {
  [UserRole.ADMIN]: 'bg-purple-100 text-purple-800 border-purple-200',
  [UserRole.STAFF]: 'bg-blue-100 text-blue-800 border-blue-200',
  [UserRole.RESIDENT]: 'bg-green-100 text-green-800 border-green-200',
}

export default function AnnouncementList({
  announcements: initialAnnouncements,
  onAnnouncementsChange,
  onAnnouncementSelect,
  onSelectAllAnnouncements,
  selectedAnnouncements = [],
  loading = false
}: AnnouncementListProps) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.ok) {
        const updatedAnnouncements = announcements.filter(a => a._id !== id)
        setAnnouncements(updatedAnnouncements)
        onAnnouncementsChange?.(updatedAnnouncements)
        toast.success('Announcement deleted successfully!')
      } else {
        toast.error('Failed to delete announcement')
      }
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast.error('Error deleting announcement')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Announcements List */}
      <div className="p-6">
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            announcements.map((announcement) => {
              const createdBy = typeof announcement.createdBy === 'object' ? announcement.createdBy : null

              return (
                <div
                  key={announcement._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-200 bg-gradient-to-r from-white to-gray-50/30"
                >
                  {/* Selection Checkbox */}
                  {onAnnouncementSelect && (
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        checked={selectedAnnouncements.includes(announcement._id)}
                        onChange={(e) => onAnnouncementSelect(announcement._id, e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {announcement.isPinned && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full border border-yellow-200">
                            <Pin className="w-3 h-3 fill-yellow-600" />
                            PINNED
                          </div>
                        )}
                        <h3 className="text-xl font-semibold text-gray-900 leading-tight">{announcement.title}</h3>
                      </div>

                      <p className="text-gray-700 mb-4 leading-relaxed line-clamp-3">{announcement.content}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center border border-indigo-200">
                            <User className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className="font-medium">{createdBy?.name || 'Unknown'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center border border-blue-200">
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                        </div>

                        {announcement.targetRoles && announcement.targetRoles.length > 0 && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-green-600" />
                            <div className="flex gap-1">
                              {announcement.targetRoles.map((role) => (
                                <span
                                  key={role}
                                  className={`px-2 py-1 text-xs font-semibold rounded-full border ${roleColors[role as UserRole] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
                                >
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-6">
                      <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {announcements.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 text-sm text-gray-600 bg-gray-50 rounded-b-lg">
          Showing {announcements.length} of {announcements.length} announcements
        </div>
      )}
    </div>
  )
}

