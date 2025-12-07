'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Bell, X } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { UserRole } from '@/types/enums'
import { IAnnouncement } from '@/types'

export default function AdminEditAnnouncementPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [existingAttachments, setExistingAttachments] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPinned: false,
    targetRoles: [UserRole.RESIDENT],
    expiresAt: '',
  })

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/announcements/${id}`, {
          credentials: 'include'
        })

        if (!res.ok) {
          throw new Error('Failed to fetch announcement')
        }

        const data = await res.json()
        if (data.success && data.data.announcement) {
          const announcement = data.data.announcement
          setFormData({
            title: announcement.title || '',
            content: announcement.content || '',
            isPinned: announcement.isPinned || false,
            targetRoles: announcement.targetRoles || [UserRole.RESIDENT],
            expiresAt: announcement.expiresAt
              ? new Date(announcement.expiresAt).toISOString().slice(0, 16)
              : '',
          })
          setExistingAttachments(announcement.attachments || [])
        } else {
          toast.error('Announcement not found')
          router.push('/admin/announcements')
        }
      } catch (error) {
        console.error('Error fetching announcement:', error)
        toast.error('Failed to load announcement')
        router.push('/admin/announcements')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchAnnouncement()
    }
  }, [id, router])

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachments([...attachments, ...newFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const removeExistingAttachment = (index: number) => {
    setExistingAttachments(existingAttachments.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('content', formData.content)
      formDataToSend.append('isPinned', formData.isPinned.toString())
      formDataToSend.append('targetRoles', JSON.stringify(formData.targetRoles))
      formDataToSend.append('existingAttachments', JSON.stringify(existingAttachments))
      
      if (formData.expiresAt) {
        formDataToSend.append('expiresAt', formData.expiresAt)
      } else {
        formDataToSend.append('expiresAt', '')
      }

      attachments.forEach((file) => {
        formDataToSend.append('attachments', file)
      })

      const res = await fetch(`/api/announcements/${id}`, {
        method: 'PATCH',
        body: formDataToSend,
        credentials: 'include'
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Announcement updated successfully!')
        router.push('/admin/announcements')
      } else {
        toast.error(data.error || 'Failed to update announcement')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleRoleToggle = (role: UserRole) => {
    setFormData({
      ...formData,
      targetRoles: formData.targetRoles.includes(role)
        ? formData.targetRoles.filter(r => r !== role)
        : [...formData.targetRoles, role]
    })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading announcement...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/announcements"
                className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Announcements</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Edit Announcement</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-gray-400" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Edit Announcement</h2>
                <p className="text-sm text-gray-600">Update announcement details and settings</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Announcement title"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                required
                rows={8}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Announcement content..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Target Audience *
                </label>
                <div className="space-y-2">
                  {Object.values(UserRole).map((role) => (
                    <label key={role} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.targetRoles.includes(role)}
                        onChange={() => handleRoleToggle(role)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {role === UserRole.ADMIN ? 'Administrators' :
                         role === UserRole.STAFF ? 'Staff Members' : 'Residents'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    id="expiresAt"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPinned" className="ml-2 block text-sm text-gray-700">
                    Pin this announcement (appears at top)
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-2">
                Attachments
              </label>
              
              {/* Existing Attachments */}
              {existingAttachments.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-sm text-gray-600 mb-2">Existing Attachments:</p>
                  {existingAttachments.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-800 truncate max-w-md"
                      >
                        {url.split('/').pop() || `Attachment ${index + 1}`}
                      </a>
                      <button
                        type="button"
                        onClick={() => removeExistingAttachment(index)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New Attachments Upload */}
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <div className="text-gray-400">
                    <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="attachments" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                      <span>Upload files</span>
                      <input
                        id="attachments"
                        name="attachments"
                        type="file"
                        multiple
                        onChange={handleAttachmentChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG up to 10MB each</p>
                </div>
              </div>
              
              {attachments.length > 0 && (
                <div className="mt-4 grid grid-cols-1 gap-2">
                  <p className="text-sm text-gray-600 mb-2">New Attachments:</p>
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Link
                href="/admin/announcements"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Announcement</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

