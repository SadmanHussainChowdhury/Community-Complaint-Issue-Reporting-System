import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@/types/enums'
import { ApiResponse } from '@/types'
import { sendEmail } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

// Twilio client (will be initialized if credentials are available)
let twilioClient: any = null

const initTwilio = async () => {
  if (twilioClient) return twilioClient

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (accountSid && authToken && fromNumber) {
    try {
      // Dynamic import of Twilio
      const twilio = await import('twilio')
      twilioClient = twilio.default(accountSid, authToken)
      return twilioClient
    } catch (error) {
      console.error('Error initializing Twilio:', error)
      return null
    }
  }
  return null
}

const sendSMS = async (to: string, message: string): Promise<boolean> => {
  const client = await initTwilio()
  if (!client) {
    console.log('Twilio not configured. Would send SMS to:', to, message)
    return false
  }

  try {
    const fromNumber = process.env.TWILIO_PHONE_NUMBER
    if (!fromNumber) {
      console.error('TWILIO_PHONE_NUMBER not configured')
      return false
    }

    await client.messages.create({
      body: message,
      from: fromNumber,
      to: to,
    })

    return true
  } catch (error: any) {
    console.error('Error sending SMS:', error)
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can send bulk messages
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    await connectDB()

    const body = await req.json()
    const { recipientType, messageType, subject, message, selectedUserIds } = body

    if (!message || !messageType) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Message and message type are required' },
        { status: 400 }
      )
    }

    if (messageType !== 'sms' && !subject) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Subject is required for emails' },
        { status: 400 }
      )
    }

    // Get recipients based on type
    let recipients: any[] = []

    switch (recipientType) {
      case 'all':
        recipients = await User.find({ isActive: true }).select('name email phone role').lean()
        break
      case 'residents':
        recipients = await User.find({ role: UserRole.RESIDENT, isActive: true })
          .select('name email phone role')
          .lean()
        break
      case 'staff':
        recipients = await User.find({ role: UserRole.STAFF, isActive: true })
          .select('name email phone role')
          .lean()
        break
      case 'selected':
        if (!selectedUserIds || selectedUserIds.length === 0) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: 'No users selected' },
            { status: 400 }
          )
        }
        recipients = await User.find({ _id: { $in: selectedUserIds }, isActive: true })
          .select('name email phone role')
          .lean()
        break
      default:
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Invalid recipient type' },
          { status: 400 }
        )
    }

    if (recipients.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No recipients found' },
        { status: 400 }
      )
    }

    // Send messages
    let sentCount = 0
    let failedCount = 0
    const results: { success: boolean; userId: string; type: string }[] = []

    for (const recipient of recipients) {
      try {
        // Send SMS if requested
        if (messageType === 'sms' || messageType === 'both') {
          if (recipient.phone) {
            const smsSuccess = await sendSMS(recipient.phone, message)
            if (smsSuccess) {
              results.push({ success: true, userId: recipient._id.toString(), type: 'sms' })
            } else {
              results.push({ success: false, userId: recipient._id.toString(), type: 'sms' })
              failedCount++
            }
          } else {
            results.push({ success: false, userId: recipient._id.toString(), type: 'sms' })
            failedCount++
          }
        }

        // Send Email if requested
        if (messageType === 'email' || messageType === 'both') {
          if (recipient.email) {
            try {
              await sendEmail({
                to: recipient.email,
                subject: subject || 'Message from Community Hub',
                html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #1e40af;">Message from Community Hub</h2>
                  <p style="line-height: 1.6; color: #374151;">${message.replace(/\n/g, '<br>')}</p>
                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                  <p style="font-size: 12px; color: #6b7280;">This is an automated message from your community management system.</p>
                </div>`,
              })
              results.push({ success: true, userId: recipient._id.toString(), type: 'email' })
            } catch (error) {
              console.error(`Error sending email to ${recipient.email}:`, error)
              results.push({ success: false, userId: recipient._id.toString(), type: 'email' })
              failedCount++
            }
          } else {
            results.push({ success: false, userId: recipient._id.toString(), type: 'email' })
            failedCount++
          }
        }

        if (messageType === 'both') {
          // Count as sent if at least one method succeeded
          const hasSuccess = results.some(
            r => r.userId === recipient._id.toString() && r.success
          )
          if (hasSuccess) {
            sentCount++
          } else {
            failedCount++
          }
        } else {
          const lastResult = results[results.length - 1]
          if (lastResult.success) {
            sentCount++
          } else {
            failedCount++
          }
        }
      } catch (error) {
        console.error(`Error processing recipient ${recipient._id}:`, error)
        failedCount++
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        sent: sentCount,
        failed: failedCount,
        total: recipients.length,
        results,
      },
      message: `Successfully sent ${sentCount} message(s)`,
    })
  } catch (error) {
    console.error('Error sending bulk messages:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to send messages' },
      { status: 500 }
    )
  }
}
