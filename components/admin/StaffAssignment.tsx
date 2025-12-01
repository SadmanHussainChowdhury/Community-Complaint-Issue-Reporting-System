'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { IUser } from '@/types'

interface StaffAssignmentProps {
  complaintId: string
  currentAssigned: any
  staffMembers: IUser[]
}

export default function StaffAssignment({
  complaintId,
  currentAssigned,
  staffMembers
}: StaffAssignmentProps) {
  const [assigningTask, setAssigningTask] = useState(false)

  const assignComplaintToStaff = async (staffId: string) => {
    setAssigningTask(true)

    try {
      const res = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignedTo: staffId }),
        credentials: 'include',
      })

      if (res.ok) {
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        console.error('Failed to assign complaint')
      }
    } catch (error) {
      console.error('Error assigning complaint:', error)
    } finally {
      setAssigningTask(false)
    }
  }

  return (
    <div className="relative">
      <select
        value={currentAssigned?._id || ''}
        onChange={(e) => assignComplaintToStaff(e.target.value)}
        disabled={assigningTask}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
      >
        <option value="">Assign Staff</option>
        {staffMembers.map((staff) => (
          <option key={staff._id} value={staff._id}>
            {staff.name}
          </option>
        ))}
      </select>
      {assigningTask && (
        <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-primary-600" />
      )}
    </div>
  )
}
