import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'
import { User, Mail, Phone, Building, Home } from 'lucide-react'

export default async function ResidentProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== UserRole.RESIDENT) {
    redirect('/auth/signin?callbackUrl=/resident/profile')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="mt-2 text-gray-600">View and manage your profile information</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{session.user.name || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{session.user.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Home className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-semibold text-gray-900 capitalize">{session.user.role || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                To edit your profile, use the profile dropdown in the sidebar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

