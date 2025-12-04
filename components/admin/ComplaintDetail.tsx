'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { IComplaint, IUser } from '@/types'
import { ComplaintStatus, UserRole } from '@/types/enums'
import StatusTracker from '@/components/StatusTracker'
import { ArrowLeft, MapPin, Calendar, User, Image as ImageIcon, MessageSquare, Edit, Trash2, Settings, Users, X, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDateForDisplay } from '@/lib/utils'

interface ComplaintDetailProps {
  complaint: IComplaint
}

export default function ComplaintDetail({ complaint: initialComplaint }: ComplaintDetailProps) {
  const router = useRouter()
  const [complaint, setComplaint] = useState(initialComplaint)
  const [loading, setLoading] = useState(false)
  const [staffMembers, setStaffMembers] = useState<IUser[]>([])
  const [showAssignment, setShowAssignment] = useState(false)

  const handleStatusChange = async (newStatus: ComplaintStatus) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/complaints/${complaint._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      })

      const data = await res.json()

      if (data.success) {
        setComplaint({ ...complaint, status: newStatus })
        toast.success('Status updated successfully')
      } else {
        toast.error(data.error || 'Failed to update status')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (staffId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/complaints/${complaint._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: staffId || null }),
        credentials: 'include'
      })

      const data = await res.json()

      if (data.success) {
        const message = staffId ? 'Complaint assigned successfully' : 'Complaint unassigned successfully'
        toast.success(message)
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to update assignment')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Fetch staff members for assignment
  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        const res = await fetch('/api/users?role=STAFF', {
          credentials: 'include'
        })

        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setStaffMembers(data.data.users || [])
          }
        }
      } catch (error) {
        console.error('Error fetching staff members:', error)
      }
    }

    fetchStaffMembers()
  }, [])

  const submittedBy = typeof complaint.submittedBy === 'object' ? complaint.submittedBy : null
  const assignedTo = typeof complaint.assignedTo === 'object' ? complaint.assignedTo : null

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-6 text-primary-600 hover:text-primary-700 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Complaints
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{complaint.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDateForDisplay(complaint.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {submittedBy?.name || 'Unknown'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/complaints/${complaint._id}/edit`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
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
        </div>

        <StatusTracker currentStatus={complaint.status} className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  {complaint.location.building && <p>Building: {complaint.location.building}</p>}
                  {complaint.location.floor && <p>Floor: {complaint.location.floor}</p>}
                  {complaint.location.room && <p>Room: {complaint.location.room}</p>}
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
          </div>

          <div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Complaint Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="ml-2 font-medium capitalize">{complaint.category.replace('_', ' ')}</span>
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
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">Admin Full Access</p>
                    <p className="text-xs text-blue-600 mt-1">
                      You have full control over this complaint regardless of assignment status.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStatusChange(ComplaintStatus.IN_PROGRESS)}
                  disabled={loading || complaint.status === ComplaintStatus.IN_PROGRESS}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => handleStatusChange(ComplaintStatus.RESOLVED)}
                  disabled={loading || complaint.status === ComplaintStatus.RESOLVED}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Mark Resolved
                </button>
              </div>

              {assignedTo && complaint.status !== ComplaintStatus.RESOLVED && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-800">Assigned to Staff</p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Currently assigned to <strong>{assignedTo.name}</strong>.
                        As admin, you can override this assignment and mark as resolved.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Staff Assignment
                  </h3>
                  <button
                    onClick={() => setShowAssignment(!showAssignment)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {showAssignment ? 'Hide' : 'Manage'}
                  </button>
                </div>

                {showAssignment && (
                  <div className="space-y-3">
                    {assignedTo ? (
                      <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-sm text-gray-900">
                            Assigned to: <strong>{assignedTo.name}</strong>
                          </span>
                        </div>
                        <button
                          onClick={() => handleAssign('')}
                          disabled={loading}
                          className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <p className="text-sm text-yellow-800">Not assigned to any staff member</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Assign to Staff Member:
                      </label>
                      <select
                        onChange={(e) => handleAssign(e.target.value)}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                        defaultValue={assignedTo?._id || ''}
                      >
                        <option value="">Unassign</option>
                        {staffMembers.map((staff) => (
                          <option key={staff._id} value={staff._id}>
                            {staff.name} ({staff.email})
                          </option>
                        ))}
                      </select>
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

