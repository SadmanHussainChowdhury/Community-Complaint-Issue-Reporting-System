import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  console.log('🔍 Staff Layout - Session:', session ? 'EXISTS' : 'NULL')
  console.log('🔍 Staff Layout - User:', session?.user ? 'EXISTS' : 'NULL')
  console.log('🔍 Staff Layout - User Role:', session?.user?.role)
  console.log('🔍 Staff Layout - Expected Staff Role:', UserRole.STAFF)

  if (!session) {
    console.log('❌ Staff Layout - No session, redirecting to signin')
    redirect('/auth/signin')
  }

  if (session.user.role !== UserRole.STAFF) {
    console.log('❌ Staff Layout - User role is not staff, redirecting to signin')
    console.log('   Current role:', session.user.role, 'Expected:', UserRole.STAFF)
    redirect('/auth/signin')
  }

  console.log('✅ Staff Layout - Access granted for staff user')

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
