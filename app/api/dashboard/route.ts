import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Complaint from '@/models/Complaint'
import Assignment from '@/models/Assignment'
import User from '@/models/User'
import { authOptions } from '@/lib/auth-options'
import { ComplaintStatus, ComplaintCategory, ComplaintPriority, UserRole } from '@/types/enums'
import { ApiResponse, DashboardStats } from '@/types'
import { jsonResponse } from '@/lib/api-response'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/dashboard - Get dashboard statistics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 401)
    }

    await connectDB()

    const userRole = session.user.role
    const userId = session.user.id
    const communityId = session.user.communityId

    let complaintQuery: Record<string, unknown> = {}

    // Role-based filtering
    if (userRole === UserRole.RESIDENT) {
      complaintQuery.submittedBy = userId
    } else if (userRole === UserRole.STAFF) {
      complaintQuery.assignedTo = userId
    }

    if (communityId) {
      complaintQuery.communityId = communityId
    }

    // Get complaint counts by status
    const [
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      allComplaints,
    ] = await Promise.all([
      Complaint.countDocuments(complaintQuery),
      Complaint.countDocuments({ ...complaintQuery, status: ComplaintStatus.PENDING }),
      Complaint.countDocuments({ ...complaintQuery, status: ComplaintStatus.IN_PROGRESS }),
      Complaint.countDocuments({ ...complaintQuery, status: ComplaintStatus.RESOLVED }),
      Complaint.find(complaintQuery).lean(),
    ])

    // Calculate complaints by category
    const complaintsByCategory: Record<ComplaintCategory, number> = {
      [ComplaintCategory.MAINTENANCE]: 0,
      [ComplaintCategory.SECURITY]: 0,
      [ComplaintCategory.CLEANLINESS]: 0,
      [ComplaintCategory.NOISE]: 0,
      [ComplaintCategory.PARKING]: 0,
      [ComplaintCategory.UTILITIES]: 0,
      [ComplaintCategory.SAFETY]: 0,
      [ComplaintCategory.OTHER]: 0,
    }

    allComplaints.forEach((complaint) => {
      complaintsByCategory[complaint.category as ComplaintCategory]++
    })

    // Calculate complaints by priority
    const complaintsByPriority: Record<ComplaintPriority, number> = {
      [ComplaintPriority.LOW]: 0,
      [ComplaintPriority.MEDIUM]: 0,
      [ComplaintPriority.HIGH]: 0,
      [ComplaintPriority.URGENT]: 0,
    }

    allComplaints.forEach((complaint) => {
      complaintsByPriority[complaint.priority as ComplaintPriority]++
    })

    // Get recent complaints
    const recentComplaints = await Complaint.find(complaintQuery)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // Staff performance (Admin only)
    let staffPerformance: DashboardStats['staffPerformance'] = []

    if (userRole === UserRole.ADMIN) {
      const staffMembers = await User.find({ role: UserRole.STAFF, isActive: true })
        .select('name email')
        .lean()

      staffPerformance = await Promise.all(
        staffMembers.map(async (staff) => {
          const assignedCount = await Complaint.countDocuments({
            assignedTo: staff._id,
            ...(communityId ? { communityId } : {}),
          })

          const resolvedComplaints = await Complaint.find({
            assignedTo: staff._id,
            status: ComplaintStatus.RESOLVED,
            ...(communityId ? { communityId } : {}),
          }).lean()

          const resolvedCount = resolvedComplaints.length

          // Calculate average resolution time
          let averageResolutionTime = 0
          if (resolvedCount > 0) {
            const totalTime = resolvedComplaints.reduce((sum, complaint) => {
              if (complaint.resolvedAt && complaint.createdAt) {
                return sum + (new Date(complaint.resolvedAt).getTime() - new Date(complaint.createdAt).getTime())
              }
              return sum
            }, 0)
            averageResolutionTime = Math.round(totalTime / resolvedCount / (1000 * 60 * 60 * 24)) // Days
          }

          return {
            staffId: staff._id.toString(),
            staffName: staff.name,
            assignedCount,
            resolvedCount,
            averageResolutionTime,
          }
        })
      )
    }

    const stats: DashboardStats = {
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      complaintsByCategory,
      complaintsByPriority,
      recentComplaints,
      staffPerformance,
    }

    return jsonResponse<{ stats: DashboardStats }>({
      success: true,
      data: { stats },
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return jsonResponse(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      500
    )
  }
}

