import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { jsonResponse } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const adminEmail = 'admin@example.com'
    const newPassword = 'admin123'

    // Find the admin user
    const adminUser = await User.findOne({ email: adminEmail })

    if (!adminUser) {
      return jsonResponse({ success: false, error: 'Admin user not found' }, 404)
    }

    // Set the new password and save (this will trigger the pre-save hook for hashing)
    adminUser.password = newPassword
    await adminUser.save()

    return jsonResponse({
      success: true,
      message: 'Admin password reset successfully',
      data: {
        email: adminEmail,
        password: newPassword
      }
    })

  } catch (error) {
    console.error('Error resetting admin password:', error)
    return jsonResponse({ success: false, error: 'Failed to reset password' }, 500)
  }
}

// Also allow GET for easy access
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const adminEmail = 'admin@example.com'
    const newPassword = 'admin123'

    // Find the admin user
    const adminUser = await User.findOne({ email: adminEmail })

    if (!adminUser) {
      return NextResponse.json({
        success: false,
        error: 'Admin user not found',
        message: 'Please run the create-admin script first'
      }, { status: 404 })
    }

    // Set the new password and save (this will trigger the pre-save hook for hashing)
    adminUser.password = newPassword
    await adminUser.save()

    return NextResponse.json({
      success: true,
      message: 'Admin password reset successfully!',
      data: {
        email: adminEmail,
        password: newPassword,
        instructions: 'Please sign in and change your password immediately for security.'
      }
    })

  } catch (error) {
    console.error('Error resetting admin password:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to reset password',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
