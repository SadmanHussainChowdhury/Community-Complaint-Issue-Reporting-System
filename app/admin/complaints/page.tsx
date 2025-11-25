'use client'

import { useState, useEffect } from 'react'
import ComplaintList from '@/components/admin/ComplaintList'
import { IComplaint } from '@/types'

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<IComplaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/complaints', {
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
          setComplaints(data.data.complaints || [])
        } else {
          setError(data.error || 'Failed to load complaints')
        }
      } catch (err) {
        setError('Failed to load complaints')
        console.error('Error fetching complaints:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchComplaints()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading complaints...</p>
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Complaints</h1>
        <p className="mt-2 text-gray-600">Manage and track all community complaints</p>
      </div>

      <ComplaintList complaints={complaints} showActions={true} />
    </div>
  )
}

