import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'
import StaffSidebar from '@/components/StaffSidebar'

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Redirect to sign in if not authenticated
  if (!session) {
    redirect('/auth/signin?callbackUrl=/staff/dashboard')
  }

  // Redirect if not staff
  if (session.user.role !== UserRole.STAFF) {
    redirect('/')
  }

  // Ensure user has required fields
  if (!session.user.id) {
    console.error('Staff Layout - Session user missing ID')
    redirect('/auth/signin?callbackUrl=/staff/dashboard')
  }

  // Ensure user object is properly structured
  const user = {
    id: session.user.id,
    name: session.user.name || null,
    email: session.user.email || null,
    role: session.user.role,
    communityId: session.user.communityId || undefined,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffSidebar user={user} />
      <div className="lg:pl-64">
        <main className="py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
