import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard'

async function getDashboardStats() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/dashboard`, {
    headers: {
      Cookie: `next-auth.session-token=${session.user?.id}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) return null

  const data = await res.json()
  return data.data?.stats || null
}

export default async function AdminAnalyticsPage() {
  const stats = await getDashboardStats()

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

