import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'

export default async function DebugPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Session Debug Information</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            <p><strong>NEXTAUTH_URL:</strong> {process.env.NEXTAUTH_URL}</p>
            <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Redirect Logic Test</h2>
          {session ? (
            <div>
              <p className="text-green-600 mb-4">✅ Session found!</p>
              <p><strong>User ID:</strong> {session.user?.id}</p>
              <p><strong>Email:</strong> {session.user?.email}</p>
              <p><strong>Name:</strong> {session.user?.name}</p>
              <p><strong>Role:</strong> {session.user?.role}</p>

              <div className="mt-6">
                <p className="font-semibold mb-2">Expected Redirect:</p>
                {(() => {
                  switch (session.user?.role) {
                    case UserRole.ADMIN:
                      return <p className="text-blue-600">→ /admin/dashboard</p>
                    case UserRole.STAFF:
                      return <p className="text-green-600">→ /staff/dashboard</p>
                    case UserRole.RESIDENT:
                      return <p className="text-purple-600">→ /resident/dashboard</p>
                    default:
                      return <p className="text-red-600">❌ No valid role found</p>
                  }
                })()}
              </div>
            </div>
          ) : (
            <p className="text-red-600">❌ No session found - user not authenticated</p>
          )}
        </div>
      </div>
    </div>
  )
}
