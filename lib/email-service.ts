import nodemailer from 'nodemailer'

// Email templates enum
export enum EmailTemplates {
  NEW_COMPLAINT_ADMIN = 'NEW_COMPLAINT_ADMIN',
  COMPLAINT_STATUS_UPDATE = 'COMPLAINT_STATUS_UPDATE',
  COMPLAINT_ASSIGNED = 'COMPLAINT_ASSIGNED',
}

interface EmailOptions {
  to: string
  subject: string
  template?: EmailTemplates
  context?: Record<string, any>
  html?: string
}

// Email template helpers (for backward compatibility with existing code)
export const emailTemplates = {
  complaintSubmitted: (context: { title: string; id: string; category: string }) => ({
    subject: `Complaint Submitted: ${context.title}`,
    template: EmailTemplates.NEW_COMPLAINT_ADMIN,
    context: {
      complaintTitle: context.title,
      complaintId: context.id,
      complaintCategory: context.category,
    },
  }),
  complaintStatusChanged: (context: { title: string; id: string; status: string; previousStatus?: string }) => ({
    subject: `Complaint Status Updated: ${context.title}`,
    template: EmailTemplates.COMPLAINT_STATUS_UPDATE,
    context: {
      complaintTitle: context.title,
      complaintId: context.id,
      newStatus: context.status,
      oldStatus: context.previousStatus || 'Unknown',
    },
  }),
  complaintResolved: (context: { title: string; id: string }) => ({
    subject: `Complaint Resolved: ${context.title}`,
    template: EmailTemplates.COMPLAINT_STATUS_UPDATE,
    context: {
      complaintTitle: context.title,
      complaintId: context.id,
      newStatus: 'Resolved',
    },
  }),
  complaintAssigned: (context: { title: string; id: string; staffName?: string }) => ({
    subject: `New Complaint Assignment: ${context.title}`,
    template: EmailTemplates.COMPLAINT_ASSIGNED,
    context: {
      complaintTitle: context.title,
      complaintId: context.id,
      staffName: context.staffName || 'Staff Member',
    },
  }),
}

// Create transporter (configure with your email service)
const createTransporter = () => {
  // Use environment variables for email configuration
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }
  
  // Fallback to console logging if email is not configured
  return null
}

// Render email template
const renderTemplate = (template: EmailTemplates, context: Record<string, any>): string => {
  switch (template) {
    case EmailTemplates.NEW_COMPLAINT_ADMIN:
      return `
        <h2>New Complaint Submitted</h2>
        <p><strong>Title:</strong> ${context.complaintTitle}</p>
        <p><strong>Description:</strong> ${context.complaintDescription}</p>
        <p><strong>Category:</strong> ${context.complaintCategory}</p>
        <p><strong>Priority:</strong> ${context.complaintPriority}</p>
        <p><strong>Submitted By:</strong> ${context.submittedBy} (${context.submittedByEmail})</p>
        <p><a href="${context.complaintLink}">View Complaint</a></p>
      `
    
    case EmailTemplates.COMPLAINT_STATUS_UPDATE:
      return `
        <h2>Complaint Status Updated</h2>
        <p>Hello ${context.residentName},</p>
        <p>Your complaint "<strong>${context.complaintTitle}</strong>" status has been updated.</p>
        <p><strong>Previous Status:</strong> ${context.oldStatus}</p>
        <p><strong>New Status:</strong> ${context.newStatus}</p>
        <p><a href="${context.complaintLink}">View Complaint</a></p>
      `
    
    case EmailTemplates.COMPLAINT_ASSIGNED:
      return `
        <h2>New Complaint Assignment</h2>
        <p>Hello ${context.staffName},</p>
        <p>You have been assigned a new complaint:</p>
        <p><strong>Title:</strong> ${context.complaintTitle}</p>
        <p><strong>Description:</strong> ${context.complaintDescription}</p>
        <p><a href="${context.complaintLink}">View Complaint</a></p>
      `
    
    default:
      return `<p>${JSON.stringify(context)}</p>`
  }
}

// Send email
export async function sendEmail(options: EmailOptions): Promise<void> {
  const transporter = createTransporter()
  
  if (!transporter) {
    // Email service not configured
    return
  }

  try {
    let html = options.html
    if (!html && options.template && options.context) {
      html = renderTemplate(options.template, options.context)
    } else if (!html) {
      html = '<p>No email content provided.</p>'
    }
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@communityhub.com',
      to: options.to,
      subject: options.subject,
      html,
    })
  } catch (error) {
    console.error('Error sending email:', error)
    // Don't throw error - email failure shouldn't break the application
  }
}
