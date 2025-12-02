import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'
import AdminSidebar from '@/components/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  console.log('🔍 Admin Layout - Session:', session ? 'EXISTS' : 'NULL')
  console.log('🔍 Admin Layout - User:', session?.user ? 'EXISTS' : 'NULL')
  console.log('🔍 Admin Layout - User Role:', session?.user?.role)
  console.log('🔍 Admin Layout - Expected Admin Role:', UserRole.ADMIN)

  // Redirect to sign in if not authenticated
  if (!session) {
    console.log('❌ Admin Layout - No session, redirecting to signin')
    redirect('/auth/signin?callbackUrl=/admin/dashboard')
  }

  // Redirect if not admin
  if (session.user.role !== UserRole.ADMIN) {
    console.log('❌ Admin Layout - User role is not admin, redirecting to home')
    console.log('   Current role:', session.user.role, 'Expected:', UserRole.ADMIN)
    redirect('/')
  }

  console.log('✅ Admin Layout - Access granted for admin user')

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar user={session.user} />
      <div className="lg:pl-64">
        <main className="py-8">
          {children}
        </main>
      </div>
    </div>
  )
}

