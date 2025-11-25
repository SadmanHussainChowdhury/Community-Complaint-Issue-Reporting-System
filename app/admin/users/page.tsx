import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import UserList from '@/components/admin/UserList'

async function getUsers() {
  const session = await getServerSession(authOptions)
  if (!session) return { users: [] }

  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/users`, {
    headers: {
      Cookie: `next-auth.session-token=${session.user?.id}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) return { users: [] }

  const data = await res.json()
  return { users: data.data?.users || [] }
}

export default async function AdminUsersPage() {
  const { users } = await getUsers()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">Manage residents, staff, and administrators</p>
        </div>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          + Add User
        </button>
      </div>

      <UserList users={users} />
    </div>
  )
}

