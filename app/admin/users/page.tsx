import UsersTable from '@/components/admin/UsersTable'
import Link from 'next/link'

async function getUsers(page: number = 1, limit: number = 10) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/users?page=${page}&limit=${limit}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      console.error('Failed to fetch users')
      return { users: [], total: 0, page, limit }
    }

    const data = await res.json()
    return {
      users: data.data.users || [],
      total: data.data.total || 0,
      page: data.data.page || page,
      limit: data.data.limit || limit
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { users: [], total: 0, page, limit }
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

