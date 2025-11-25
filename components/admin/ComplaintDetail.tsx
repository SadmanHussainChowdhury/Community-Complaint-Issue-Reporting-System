'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IComplaint } from '@/types'
import { ComplaintStatus } from '@/types/enums'
import StatusTracker from '@/components/StatusTracker'
import { ArrowLeft, MapPin, Calendar, User, Image as ImageIcon, MessageSquare, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ComplaintDetailProps {
  complaint: IComplaint
}

export default function ComplaintDetail({ complaint: initialComplaint }: ComplaintDetailProps) {
  const router = useRouter()
  const [complaint, setComplaint] = useState(initialComplaint)
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus: ComplaintStatus) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/complaints/${complaint._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
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
        body: JSON.stringify({ assignedTo: staffId }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Complaint assigned successfully')
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to assign complaint')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

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
                    <img
                      key={index}
                      src={image}
                      alt={`Complaint image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
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

            <div className="space-y-2">
              <button
                onClick={() => handleStatusChange(ComplaintStatus.IN_PROGRESS)}
                disabled={loading || complaint.status === ComplaintStatus.IN_PROGRESS}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Mark In Progress
              </button>
              <button
                onClick={() => handleStatusChange(ComplaintStatus.RESOLVED)}
                disabled={loading || complaint.status === ComplaintStatus.RESOLVED}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

