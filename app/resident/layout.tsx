import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'
import ResidentSidebar from '@/components/ResidentSidebar'

export default async function ResidentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Redirect to sign in if not authenticated
  if (!session) {
    redirect('/auth/signin?callbackUrl=/resident/dashboard')
  }

  // Redirect if not resident
  if (session.user.role !== UserRole.RESIDENT) {
    redirect('/')
  }

  // Ensure user has required fields
  if (!session.user.id) {
    redirect('/auth/signin?callbackUrl=/resident/dashboard')
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
      <ResidentSidebar user={user} />
      <div className="lg:pl-64">
        <main className="py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
