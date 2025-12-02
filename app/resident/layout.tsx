import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'

export default async function ResidentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  console.log('🔍 Resident Layout - Session:', session ? 'EXISTS' : 'NULL')
  console.log('🔍 Resident Layout - User:', session?.user ? 'EXISTS' : 'NULL')
  console.log('🔍 Resident Layout - User Role:', session?.user?.role)
  console.log('🔍 Resident Layout - Expected Resident Role:', UserRole.RESIDENT)

  if (!session) {
    console.log('❌ Resident Layout - No session, redirecting to signin')
    redirect('/auth/signin')
  }

  if (session.user.role !== UserRole.RESIDENT) {
    console.log('❌ Resident Layout - User role is not resident, redirecting to signin')
    console.log('   Current role:', session.user.role, 'Expected:', UserRole.RESIDENT)
    redirect('/auth/signin')
  }

  console.log('✅ Resident Layout - Access granted for resident user')

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
