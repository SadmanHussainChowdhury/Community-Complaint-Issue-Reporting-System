'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import StatusTracker from '@/components/StatusTracker'
import FeedbackForm from '@/components/FeedbackForm'
import { IComplaint, ComplaintNote } from '@/types'
import { ComplaintStatus } from '@/types/enums'
import { MapPin, Calendar, User, Image as ImageIcon, MessageSquare, Star } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ComplaintDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [complaint, setComplaint] = useState<IComplaint | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFeedback, setShowFeedback] = useState(false)

  const loadComplaint = useCallback(async () => {
    try {
      const res = await fetch(`/api/complaints/${params.id}`, {
        credentials: 'include'
      })
      const data = await res.json()

      if (data.success) {
        setComplaint(data.data.complaint)
        // Show feedback form if complaint is resolved and no feedback yet
        if (
          data.data.complaint.status === ComplaintStatus.RESOLVED &&
          !data.data.complaint.feedback?.rating
        ) {
          setShowFeedback(true)
        }
      } else {
        toast.error(data.error || 'Failed to load complaint')
        router.push('/resident/dashboard')
      }
    } catch (error) {
      toast.error('An error occurred')
      router.push('/resident/dashboard')
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    if (params.id) {
      loadComplaint()
    }
  }, [params.id, loadComplaint])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-500">Complaint not found</p>
        </div>
      </div>
    )
  }

  const submittedBy = typeof complaint.submittedBy === 'object' ? complaint.submittedBy : null
  const assignedTo = typeof complaint.assignedTo === 'object' ? complaint.assignedTo : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 text-primary-600 hover:text-primary-700 flex items-center gap-2"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{complaint.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {submittedBy?.name || 'Unknown'}
                </span>
              </div>
            </div>
            <span
              className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${
                  complaint.status === ComplaintStatus.PENDING
                    ? 'bg-yellow-100 text-yellow-700'
                    : complaint.status === ComplaintStatus.IN_PROGRESS
                    ? 'bg-blue-100 text-blue-700'
                    : complaint.status === ComplaintStatus.RESOLVED
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }
              `}
            >
              {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1).replace('_', ' ')}
            </span>
          </div>

          <StatusTracker currentStatus={complaint.status} className="mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
              </div>

              {complaint.location && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location
                  </h2>
                  <div className="text-gray-700">
                    {complaint.location.building && (
                      <p>
                        <strong>Building:</strong> {complaint.location.building}
                      </p>
                    )}
                    {complaint.location.floor && (
                      <p>
                        <strong>Floor:</strong> {complaint.location.floor}
                      </p>
                    )}
                    {complaint.location.room && (
                      <p>
                        <strong>Room:</strong> {complaint.location.room}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {complaint.images && complaint.images.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Images
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {complaint.images.map((image, index) => (
                      <div key={index} className="relative w-full h-48 rounded-lg overflow-hidden">
                        <Image
                          src={image}
                          alt={`Complaint image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {complaint.notes && complaint.notes.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Notes & Updates
                  </h2>
                  <div className="space-y-4">
                    {complaint.notes.map((note: ComplaintNote, index: number) => {
                      const addedBy = typeof note.addedBy === 'object' ? note.addedBy : null
                      return (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-gray-900">
                              {addedBy?.name || 'Unknown'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(note.addedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{note.content}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {complaint.feedback?.rating && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Your Feedback
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold">{complaint.feedback.rating}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= complaint.feedback!.rating!
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {complaint.feedback.comment && (
                      <p className="text-gray-700 mt-2">{complaint.feedback.comment}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">Complaint Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium capitalize">{complaint.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Priority:</span>
                    <span className="ml-2 font-medium capitalize">{complaint.priority}</span>
                  </div>
                  {assignedTo && (
                    <div>
                      <span className="text-gray-600">Assigned To:</span>
                      <span className="ml-2 font-medium">{assignedTo.name}</span>
                    </div>
                  )}
                  {complaint.resolvedAt && (
                    <div>
                      <span className="text-gray-600">Resolved:</span>
                      <span className="ml-2 font-medium">
                        {new Date(complaint.resolvedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {showFeedback && !complaint.feedback?.rating && (
            <div className="mt-6">
              <FeedbackForm
                complaintId={complaint._id}
                onSubmitted={() => {
                  setShowFeedback(false)
                  loadComplaint()
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

