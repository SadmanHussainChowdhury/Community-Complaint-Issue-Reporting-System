'use client'

import Link from 'next/link'
import Image from 'next/image'
import { IComplaint } from '@/types'
import { getStatusColor, getPriorityColor, getCategoryIcon, formatDate } from '@/lib/utils'
import { ComplaintStatus } from '@/types/enums'

interface ComplaintCardProps {
  complaint: IComplaint
  showActions?: boolean
}

export default function ComplaintCard({ complaint, showActions = false }: ComplaintCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getCategoryIcon(complaint.category)}</span>
            <Link
              href={`/complaints/${complaint._id}`}
              className="text-lg font-semibold text-gray-900 hover:text-primary-600"
            >
              {complaint.title}
            </Link>
          </div>
          <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
          <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
              {complaint.status.replace('_', ' ')}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
              {complaint.priority}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {complaint.category}
            </span>
          </div>
        </div>
      </div>

      {complaint.images && complaint.images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {complaint.images.slice(0, 3).map((image, idx) => (
            <div key={idx} className="relative h-24 w-full rounded overflow-hidden">
              <Image
                src={image}
                alt={`Complaint image ${idx + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>
          <p>
            Submitted by:{' '}
            {typeof complaint.submittedBy === 'object'
              ? complaint.submittedBy.name
              : 'Unknown'}
          </p>
          {complaint.assignedTo && (
            <p>
              Assigned to:{' '}
              {typeof complaint.assignedTo === 'object'
                ? complaint.assignedTo.name
                : 'Unassigned'}
            </p>
          )}
        </div>
        <p>{formatDate(complaint.createdAt)}</p>
      </div>

      {showActions && complaint.status !== ComplaintStatus.RESOLVED && (
        <div className="mt-4 flex gap-2">
          <Link
            href={`/complaints/${complaint._id}/edit`}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm"
          >
            Edit
          </Link>
        </div>
      )}
    </div>
  )
}

