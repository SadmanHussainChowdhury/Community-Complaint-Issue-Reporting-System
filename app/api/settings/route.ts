import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Settings from '@/models/Settings'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'
import { ApiResponse } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can access settings
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    await connectDB()

    // Get or create settings
    let settings = await Settings.findOne()
    if (!settings) {
      settings = await Settings.create({})
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can update settings
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    await connectDB()

    const body = await req.json()

    // Get or create settings
    let settings = await Settings.findOne()
    if (!settings) {
      settings = await Settings.create({})
    }

    // Update settings with provided values
    Object.keys(body).forEach((key) => {
      if (key in settings.toObject()) {
        settings[key] = body[key]
      }
    })

    await settings.save()

    return NextResponse.json<ApiResponse>({
      success: true,
      data: settings,
      message: 'Settings updated successfully',
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
