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

  // Redirect to sign in if not authenticated
  if (!session) {
    redirect('/auth/signin?callbackUrl=/admin/dashboard')
  }

  // Redirect if not admin
  if (session.user.role !== UserRole.ADMIN) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar user={session.user} />
      <div className="lg:pl-64 transition-all duration-200">
        <main className="py-8">
          {children}
        </main>
      </div>
    </div>
  )
}

