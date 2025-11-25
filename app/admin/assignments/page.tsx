'use client'

import { useState, useEffect } from 'react'
import AssignmentList from '@/components/admin/AssignmentList'
import { IAssignment } from '@/types'
import Link from 'next/link'

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<IAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/assignments', {
          credentials: 'include'
        })

        if (!res.ok) {
          if (res.status === 401) {
            setError('Authentication required. Please sign in again.')
            return
          }
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        const contentType = res.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned invalid response format')
        }

        const data = await res.json()

        if (data.success) {
          setAssignments(data.data.assignments || [])
        } else {
          setError(data.error || 'Failed to load assignments')
        }
      } catch (err) {
        setError('Failed to load assignments')
        console.error('Error fetching assignments:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Assignments</h1>
          <p className="mt-2 text-gray-600">Manage complaint assignments to staff members</p>
        </div>
        <Link
          href="/admin/assignments/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 inline-flex items-center space-x-2"
        >
          <span>+</span>
          <span>New Assignment</span>
        </Link>
      </div>

      <AssignmentList assignments={assignments} />
    </div>
  )
}

