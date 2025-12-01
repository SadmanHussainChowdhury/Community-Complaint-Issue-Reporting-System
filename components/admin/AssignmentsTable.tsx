'use client'

import { useState } from 'react'
import { IAssignment } from '@/types'
import AssignmentList from '@/components/admin/AssignmentList'
import Pagination from '@/components/ui/Pagination'

interface AssignmentsTableProps {
  initialAssignments: IAssignment[]
  initialTotal: number
  initialPage: number
  initialLimit: number
}

export default function AssignmentsTable({
  initialAssignments,
  initialTotal,
  initialPage,
  initialLimit
}: AssignmentsTableProps) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [assignments, setAssignments] = useState(initialAssignments)
  const [loading, setLoading] = useState(false)

  const fetchAssignments = async (page: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/assignments?page=${page}&limit=${initialLimit}`)
      if (res.ok) {
        const data = await res.json()
        setAssignments(data.data.assignments || [])
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    fetchAssignments(page)
  }

  const handleAssignmentsChange = (updatedAssignments: IAssignment[]) => {
    setAssignments(updatedAssignments)
  }

  return (
    <div className="space-y-6">
      <AssignmentList assignments={assignments} onAssignmentsChange={handleAssignmentsChange} />

      <Pagination
        currentPage={currentPage}
        totalItems={initialTotal}
        itemsPerPage={initialLimit}
        onPageChange={handlePageChange}
        showPageJump={initialTotal > 100}
        className="border-0 shadow-2xl bg-gradient-to-br from-white via-slate-50 to-white"
      />
    </div>
  )
}
