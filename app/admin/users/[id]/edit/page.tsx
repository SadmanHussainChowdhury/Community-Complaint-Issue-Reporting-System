import { notFound, redirect } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'
import EditUserForm from '@/components/admin/EditUserForm'

export const dynamic = 'force-dynamic'

async function getUser(id: string) {
  try {
    await connectDB()
    const user = await User.findById(id).select('-password').lean()
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect('/admin/dashboard')
  }

  const user = await getUser(id)

  if (!user) {
    notFound()
  }

  return <EditUserForm user={user} />
}

