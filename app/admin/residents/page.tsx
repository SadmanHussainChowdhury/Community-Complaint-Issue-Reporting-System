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

    // Convert MongoDB objects to plain objects for client component
    // Note: Next.js will automatically serialize Date objects to strings when passing to client components
    const serializedResidents: IUser[] = residents.map(u => ({
      _id: String(u._id),
      name: String(u.name),
      email: String(u.email),
      password: '', // Required by IUser but not used/displayed
      role: u.role,
      phone: u.phone ? String(u.phone) : undefined,
      apartment: u.apartment ? String(u.apartment) : undefined,
      building: u.building ? String(u.building) : undefined,
      communityId: u.communityId ? String(u.communityId) : undefined,
      isActive: u.isActive !== false,
      createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
      updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date()
    }))

    console.log('Server-side: Found', serializedResidents.length, 'residents (page', page, 'of', Math.ceil(total / limit), ')')
    return {
      residents: serializedResidents,
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
          href="/admin/users/new"
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