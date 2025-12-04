import UsersTable from '@/components/admin/UsersTable'
import Link from 'next/link'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { IUser } from '@/types'

export const dynamic = 'force-dynamic'

async function getUsers(page: number = 1, limit: number = 10): Promise<{ users: IUser[]; total: number; page: number; limit: number }> {
  try {
    await connectDB()

    const skip = (page - 1) * limit
    const total = await User.countDocuments({})

    const users = await User.find({})
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Convert MongoDB objects to plain objects for client component
    // Note: Next.js will automatically serialize Date objects to strings when passing to client components
    const serializedUsers: IUser[] = users.map(u => ({
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

    console.log('Server-side: Found', serializedUsers.length, 'users (page', page, 'of', Math.ceil(total / limit), ')')
    return {
      users: serializedUsers,
      total,
      page,
      limit
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return {
      users: [],
      total: 0,
      page,
      limit
    }
  }
}

export default async function AdminUsersPage() {
  const usersData = await getUsers(1, 10)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">Manage residents, staff, and administrators</p>
        </div>
        <Link
          href="/admin/users/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 inline-flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add User</span>
        </Link>
      </div>

      <UsersTable
        initialUsers={usersData.users}
        initialTotal={usersData.total}
        initialPage={usersData.page}
        initialLimit={usersData.limit}
      />
    </div>
  )
}

