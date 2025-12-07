'use client'

import { useState, useEffect } from 'react'
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard'
import { DashboardStats } from '@/types'
import { Loader } from '@/components/ui'

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/dashboard', {
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
          setStats(data.data.stats || null)
        } else {
          setError(data.error || 'Failed to load analytics')
        }
      } catch (err) {
        setError('Failed to load analytics')
        console.error('Error fetching analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader size="md" variant="primary" className="mx-auto" />
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
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
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="mt-2 text-gray-600">Comprehensive insights and performance metrics</p>
      </div>

      <AnalyticsDashboard stats={stats} />
    </div>
  )
}

