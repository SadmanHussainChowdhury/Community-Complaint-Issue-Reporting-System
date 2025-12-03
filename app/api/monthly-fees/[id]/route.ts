import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import MonthlyFee from '@/models/MonthlyFee'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'
import { ApiResponse } from '@/types'

export const dynamic = 'force-dynamic'

// PATCH /api/monthly-fees/[id] - Update monthly fee (mark as paid, update amount, etc.)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can update fees
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    await connectDB()

    const { id } = params
    const body = await req.json()
    const { status, amount, description, dueDate, paidDate, paymentMethod, paymentNotes, month, year, residentId } = body

    const fee = await MonthlyFee.findById(id)
    if (!fee) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Monthly fee not found' },
        { status: 404 }
      )
    }

    // Update fields
    if (status !== undefined) {
      fee.status = status
      if (status === 'paid' && !fee.paidDate) {
        fee.paidDate = new Date()
      }
    }

    if (amount !== undefined) {
      fee.amount = parseFloat(amount)
    }

    if (description !== undefined) {
      fee.description = description
    }

    if (dueDate !== undefined) {
      fee.dueDate = new Date(dueDate)
    }

    if (paidDate !== undefined) {
      fee.paidDate = paidDate ? new Date(paidDate) : null
    }

    if (paymentMethod !== undefined) {
      fee.paymentMethod = paymentMethod
    }

    if (paymentNotes !== undefined) {
      fee.paymentNotes = paymentNotes
    }

    if (month !== undefined) {
      fee.month = parseInt(month)
    }

    if (year !== undefined) {
      fee.year = parseInt(year)
    }

    if (residentId !== undefined) {
      fee.resident = residentId
    }

    await fee.save()
    await fee.populate('resident', 'name email phone apartment building')
    await fee.populate('createdBy', 'name')

    return NextResponse.json<ApiResponse>({
      success: true,
      data: fee,
      message: 'Monthly fee updated successfully',
    })
  } catch (error) {
    console.error('Error updating monthly fee:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update monthly fee' },
      { status: 500 }
    )
  }
}

// DELETE /api/monthly-fees/[id] - Delete monthly fee
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can delete fees
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    await connectDB()

    const { id } = params
    const fee = await MonthlyFee.findByIdAndDelete(id)

    if (!fee) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Monthly fee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Monthly fee deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting monthly fee:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete monthly fee' },
      { status: 500 }
    )
  }
}
