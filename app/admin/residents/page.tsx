import ResidentsTable from '@/components/admin/ResidentsTable'
import Link from 'next/link'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { IUser } from '@/types'

export const dynamic = 'force-dynamic'

async function getResidents(page: number = 1, limit: number = 10): Promise<{ residents: IUser[]; total: number; page: number; limit: number }> {
  try {
    await connectDB()

    const skip = (page - 1) * limit
    const total = await User.countDocuments({ role: 'resident' })

    const residents = await User.find({ role: 'resident' })
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    console.log('Server-side: Found', residents.length, 'residents (page', page, 'of', Math.ceil(total / limit), ')')
    return {
      residents: residents as IUser[],
      total,
      page,
      limit
    }
  } catch (error) {
    console.error('Error fetching residents:', error)
    return {
      residents: [],
      total: 0,
      page,
      limit
    }
  }
}

export default async function AdminResidentsPage() {
  const residentsData = await getResidents(1, 10)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Residents</h1>
          <p className="mt-2 text-gray-600">Manage community residents</p>
        </div>
        <Link
          href="/admin/residents/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 inline-flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add Resident</span>
        </Link>
      </div>

      <ResidentsTable
        initialResidents={residentsData.residents}
        initialTotal={residentsData.total}
        initialPage={residentsData.page}
        initialLimit={residentsData.limit}
      />
    </div>
  )
}