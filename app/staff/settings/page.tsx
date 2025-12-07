import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'
import { Settings as SettingsIcon } from 'lucide-react'

export default async function StaffSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== UserRole.STAFF) {
    redirect('/auth/signin?callbackUrl=/staff/settings')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h2>
              <p className="text-gray-600">
                Settings page is coming soon. Use the profile dropdown in the sidebar to edit your profile information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

