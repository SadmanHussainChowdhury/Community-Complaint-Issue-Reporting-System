import Pusher from 'pusher'

if (
  !process.env.PUSHER_APP_ID ||
  !process.env.PUSHER_KEY ||
  !process.env.PUSHER_SECRET ||
  !process.env.PUSHER_CLUSTER
) {
  console.warn('Pusher environment variables are not set. Real-time features will be disabled.')
}

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.PUSHER_CLUSTER || 'us2',
  useTLS: true,
})

export interface PusherEvent {
  channel: string
  event: string
  data: unknown
}

export async function triggerPusherEvent(
  channel: string,
  event: string,
  data: unknown
): Promise<void> {
  try {
    if (pusherServer && process.env.PUSHER_APP_ID) {
      await pusherServer.trigger(channel, event, data)
    }
  } catch (error) {
    console.error('Pusher trigger error:', error)
  }
}

// Channel names
export const CHANNELS = {
  complaint: (complaintId: string) => `complaint-${complaintId}`,
  user: (userId: string) => `user-${userId}`,
  community: (communityId: string) => `community-${communityId}`,
  admin: 'admin-updates',
} as const

// Event names
export const EVENTS = {
  COMPLAINT_CREATED: 'complaint:created',
  COMPLAINT_UPDATED: 'complaint:updated',
  COMPLAINT_ASSIGNED: 'complaint:assigned',
  COMPLAINT_STATUS_CHANGED: 'complaint:status-changed',
  ANNOUNCEMENT_CREATED: 'announcement:created',
  ASSIGNMENT_CREATED: 'assignment:created',
} as const

