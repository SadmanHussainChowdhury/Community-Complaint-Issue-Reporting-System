// Push notification service for browser notifications
'use client'

export class PushNotificationService {
  private static instance: PushNotificationService
  private permission: NotificationPermission = 'default'

  private constructor() {
    if (typeof window !== 'undefined') {
      this.permission = Notification.permission
    }
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false
    }

    if (this.permission === 'granted') {
      return true
    }

    if (this.permission === 'denied') {
      return false
    }

    const permission = await Notification.requestPermission()
    this.permission = permission
    return permission === 'granted'
  }

  async showNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return
    }

    if (this.permission !== 'granted') {
      const granted = await this.requestPermission()
      if (!granted) {
        return
      }
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'community-issue',
        requireInteraction: false,
        ...options,
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
        if (options?.data?.url) {
          window.location.href = options.data.url
        }
      }

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)
    } catch (error) {
      console.error('Error showing notification:', error)
    }
  }

  // Convenience methods
  async notifyComplaintSubmitted(complaintTitle: string): Promise<void> {
    await this.showNotification('Complaint Submitted', {
      body: `Your complaint "${complaintTitle}" has been submitted successfully.`,
      icon: '/favicon.ico',
      data: { url: '/resident/dashboard' },
    })
  }

  async notifyStatusChanged(
    complaintTitle: string,
    newStatus: string
  ): Promise<void> {
    await this.showNotification('Complaint Status Updated', {
      body: `"${complaintTitle}" status changed to ${newStatus}`,
      icon: '/favicon.ico',
      data: { url: '/resident/dashboard' },
    })
  }

  async notifyComplaintAssigned(complaintTitle: string): Promise<void> {
    await this.showNotification('New Complaint Assigned', {
      body: `You have been assigned: "${complaintTitle}"`,
      icon: '/favicon.ico',
      data: { url: '/staff/dashboard' },
    })
  }

  async notifyComplaintResolved(complaintTitle: string): Promise<void> {
    await this.showNotification('Complaint Resolved', {
      body: `"${complaintTitle}" has been resolved. Please provide feedback.`,
      icon: '/favicon.ico',
      data: { url: '/resident/dashboard' },
    })
  }

  async notifyAnnouncement(title: string): Promise<void> {
    await this.showNotification('New Announcement', {
      body: title,
      icon: '/favicon.ico',
      data: { url: '/' },
    })
  }
}

// Export singleton instance
export const pushNotifications = PushNotificationService.getInstance()

