import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import ActivityLog from '@/models/ActivityLog'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'
import { ApiResponse, IUser } from '@/types'

// GET /api/users/[id] - Get single user
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Users can only view their own profile unless they're admin
    if (session.user.role !== UserRole.ADMIN && session.user.id !== params.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Access denied' }, { status: 403 })
    }

    const user = await User.findById(params.id).select('-password').lean()

    if (!user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json<ApiResponse<{ user: IUser }>>({
      success: true,
      data: { user },
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PATCH /api/users/[id] - Update user
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(params.id)
    if (!user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const updates: Record<string, unknown> = {}

    // Users can only update their own profile (limited fields)
    if (session.user.role !== UserRole.ADMIN && session.user.id !== params.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Access denied' }, { status: 403 })
    }

    // Non-admins can only update certain fields
    if (session.user.role !== UserRole.ADMIN) {
      if (body.name) updates.name = body.name
      if (body.phone) updates.phone = body.phone
      if (body.apartment) updates.apartment = body.apartment
      if (body.building) updates.building = body.building
    } else {
      // Admin can update everything
      if (body.name) updates.name = body.name
      if (body.email) updates.email = body.email
      if (body.role) updates.role = body.role
      if (body.phone) updates.phone = body.phone
      if (body.apartment) updates.apartment = body.apartment
      if (body.building) updates.building = body.building
      if (body.communityId) updates.communityId = body.communityId
      if (body.isActive !== undefined) updates.isActive = body.isActive
      if (body.password) {
        // Password will be hashed by the pre-save hook
        updates.password = body.password
      }
    }

    const updatedUser = await User.findByIdAndUpdate(params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password')

    if (!updatedUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Log activity
    await ActivityLog.create({
      user: session.user.id,
      action: 'user_updated',
      entityType: 'user',
      entityId: params.id,
      details: updates,
      communityId: session.user.communityId,
    })

    return NextResponse.json<ApiResponse<{ user: IUser }>>({
      success: true,
      data: { user: updatedUser },
      message: 'User updated successfully',
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Delete user (Admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Prevent self-deletion
    if (session.user.id === params.id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    const user = await User.findByIdAndDelete(params.id)
    if (!user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Log activity
    await ActivityLog.create({
      user: session.user.id,
      action: 'user_deleted',
      entityType: 'user',
      entityId: params.id,
      details: { name: user.name, email: user.email },
      communityId: session.user.communityId,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

