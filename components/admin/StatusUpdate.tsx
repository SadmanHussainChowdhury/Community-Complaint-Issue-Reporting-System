'use client'

import { useState } from 'react'
import { Loader2, PlayCircle, CheckCircle2, Award } from 'lucide-react'

interface StatusUpdateProps {
  complaintId: string
  currentStatus: string
}

export default function StatusUpdate({
  complaintId,
  currentStatus
}: StatusUpdateProps) {
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const updateComplaintStatus = async (newStatus: string) => {
    setUpdatingStatus(true)

    try {
      const res = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      })

      if (res.ok) {
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        console.error('Failed to update complaint status')
      }
    } catch (error) {
      console.error('Error updating complaint status:', error)
    } finally {
      setUpdatingStatus(false)
    }
  }

  return (
    <div className="flex gap-2">
      {currentStatus === 'pending' && (
        <button
          onClick={() => updateComplaintStatus('in_progress')}
          disabled={updatingStatus}
          className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {updatingStatus ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <PlayCircle className="w-3 h-3" />
          )}
          Start
        </button>
      )}

      {currentStatus === 'in_progress' && (
        <button
          onClick={() => updateComplaintStatus('resolved')}
          disabled={updatingStatus}
          className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          {updatingStatus ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3 h-3" />
          )}
          Complete
        </button>
      )}

      {currentStatus === 'resolved' && (
        <div className="flex items-center gap-1 px-3 py-2 bg-emerald-100 text-emerald-800 text-sm rounded-lg">
          <Award className="w-3 h-3" />
          Done
        </div>
      )}
    </div>
  )
}
