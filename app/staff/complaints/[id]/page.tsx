'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import StatusTracker from '@/components/StatusTracker'
import { IComplaint, ComplaintNote } from '@/types'
import { ComplaintStatus } from '@/types/enums'
import {
  MapPin,
  Calendar,
  User,
  Image as ImageIcon,
  MessageSquare,
  ArrowLeft,
  PlayCircle,
  CheckCircle2,
  Loader2,
  Send,
  Clock,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function StaffComplaintDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [complaint, setComplaint] = useState<IComplaint | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)

  const loadComplaint = useCallback(async () => {
    try {
      const res = await fetch(`/api/complaints/${params.id}`, {
        credentials: 'include'
      })
      const data = await res.json()

      if (data.success) {
        setComplaint(data.data.complaint)
      } else {
        toast.error(data.error || 'Failed to load complaint')
        router.push('/staff/dashboard')
      }
    } catch (error) {
      toast.error('An error occurred')
      router.push('/staff/dashboard')
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    if (params.id) {
      loadComplaint()
    }
  }, [params.id, loadComplaint])

  const updateComplaintStatus = async (newStatus: string) => {
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/complaints/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      })

      if (res.ok) {
        setComplaint(prev => prev ? { ...prev, status: newStatus as ComplaintStatus } : null)
        toast.success(`Complaint marked as ${newStatus.replace('_', ' ')}`)
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      toast.error('Error updating status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const addNote = async () => {
    if (!newNote.trim()) return

    setAddingNote(true)
    try {
      const res = await fetch(`/api/complaints/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: newNote,
          isInternal: true
        }),
        credentials: 'include',
      })

      if (res.ok) {
        setNewNote('')
        loadComplaint() // Reload to show new note
        toast.success('Note added successfully')
      } else {
        toast.error('Failed to add note')
      }
    } catch (error) {
      toast.error('Error adding note')
    } finally {
      setAddingNote(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-500">Complaint not found</p>
        </div>
      </div>
    )
  }

  const submittedBy = typeof complaint.submittedBy === 'object' ? complaint.submittedBy : null
  const assignedTo = typeof complaint.assignedTo === 'object' ? complaint.assignedTo : null

  // Check if current staff member is assigned to this complaint
  const isAssignedToCurrentStaff = assignedTo && session?.user?.id === (typeof assignedTo === 'object' ? assignedTo._id : assignedTo)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.push('/staff/dashboard')}
            className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="flex items-center justify-between mb-6">
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
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {complaint.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Status and Actions */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Complaint Status</h2>
              {isAssignedToCurrentStaff && (
                <div className="flex gap-3">
                  {complaint.status === 'pending' && (
                    <button
                      onClick={() => updateComplaintStatus('in_progress')}
                      disabled={updatingStatus}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {updatingStatus ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <PlayCircle className="w-4 h-4" />
                      )}
                      Start Working
                    </button>
                  )}

                  {complaint.status === 'in_progress' && (
                    <button
                      onClick={() => updateComplaintStatus('resolved')}
                      disabled={updatingStatus}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {updatingStatus ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Mark as Done
                    </button>
                  )}

                  {complaint.status === 'resolved' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl">
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </div>
                  )}
                </div>
              )}
            </div>

            <StatusTracker currentStatus={complaint.status} className="mb-6" />

            {/* Assignment Info */}
            {assignedTo && (
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {typeof assignedTo === 'object' ? assignedTo.name.charAt(0).toUpperCase() : 'S'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Assigned to {typeof assignedTo === 'object' ? assignedTo.name : 'Staff Member'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isAssignedToCurrentStaff ? 'This is your assigned task' : 'Assigned to another staff member'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Complaint Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
                </div>

                {/* Location */}
                {complaint.location && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      Location
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      {complaint.location.building && (
                        <p className="text-gray-700">
                          <strong className="text-gray-900">Building:</strong> {complaint.location.building}
                        </p>
                      )}
                      {complaint.location.floor && (
                        <p className="text-gray-700">
                          <strong className="text-gray-900">Floor:</strong> {complaint.location.floor}
                        </p>
                      )}
                      {complaint.location.room && (
                        <p className="text-gray-700">
                          <strong className="text-gray-900">Room:</strong> {complaint.location.room}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Images */}
                {complaint.images && complaint.images.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-gray-600" />
                      Images
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {complaint.images.map((image, index) => (
                        <div key={index} className="relative w-full h-48 rounded-xl overflow-hidden group">
                          <Image
                            src={image}
                            alt={`Complaint image ${index + 1}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes & Updates */}
                {complaint.notes && complaint.notes.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-gray-600" />
                      Notes & Updates
                    </h3>
                    <div className="space-y-4">
                      {complaint.notes.map((note: ComplaintNote, index: number) => {
                        const addedBy = typeof note.addedBy === 'object' ? note.addedBy : null
                        return (
                          <div key={index} className={`rounded-xl p-4 ${
                            note.isInternal ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                          }`}>
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold text-gray-900">
                                {addedBy?.name || 'Unknown'}
                                {note.isInternal && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    Internal
                                  </span>
                                )}
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

                {/* Add Note Section */}
                {isAssignedToCurrentStaff && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Internal Note</h3>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add an internal note about this complaint..."
                        className="w-full p-3 border border-blue-300 rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={addNote}
                          disabled={!newNote.trim() || addingNote}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {addingNote ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          Add Note
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Complaint Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 text-sm">Category:</span>
                      <span className="ml-2 font-medium capitalize text-gray-900">
                        {complaint.category.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Priority:</span>
                      <span className={`ml-2 font-medium capitalize px-2 py-1 rounded-full text-xs ${
                        complaint.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        complaint.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {complaint.priority}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Created:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {complaint.resolvedAt && (
                      <div>
                        <span className="text-gray-600 text-sm">Resolved:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {new Date(complaint.resolvedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                {isAssignedToCurrentStaff && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      {complaint.status === 'pending' && (
                        <button
                          onClick={() => updateComplaintStatus('in_progress')}
                          disabled={updatingStatus}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50"
                        >
                          {updatingStatus ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <PlayCircle className="w-4 h-4" />
                          )}
                          Start Working
                        </button>
                      )}

                      {complaint.status === 'in_progress' && (
                        <button
                          onClick={() => updateComplaintStatus('resolved')}
                          disabled={updatingStatus}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 disabled:opacity-50"
                        >
                          {updatingStatus ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          Mark as Resolved
                        </button>
                      )}

                      {complaint.status === 'resolved' && (
                        <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-100 text-emerald-800 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                          Task Completed
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
