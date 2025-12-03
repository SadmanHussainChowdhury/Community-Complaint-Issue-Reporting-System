import mongoose, { Schema, Document } from 'mongoose'

export interface ISettings extends Document {
  communityName: string
  systemName: string
  systemEmail: string
  maintenanceMode: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  complaintNotifications: boolean
  announcementNotifications: boolean
  sessionTimeout: number
  passwordMinLength: number
  requireSpecialChars: boolean
  autoAssignComplaints: boolean
  defaultPriority: string
  allowAnonymousComplaints: boolean
  updatedAt: Date
  createdAt: Date
}

const SettingsSchema = new Schema<ISettings>(
  {
    communityName: {
      type: String,
      default: 'Community Hub',
      required: true,
    },
    systemName: {
      type: String,
      default: 'Community Complaint System',
      required: true,
    },
    systemEmail: {
      type: String,
      default: 'admin@communityhub.com',
      required: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    },
    complaintNotifications: {
      type: Boolean,
      default: true,
    },
    announcementNotifications: {
      type: Boolean,
      default: true,
    },
    sessionTimeout: {
      type: Number,
      default: 30,
    },
    passwordMinLength: {
      type: Number,
      default: 6,
    },
    requireSpecialChars: {
      type: Boolean,
      default: false,
    },
    autoAssignComplaints: {
      type: Boolean,
      default: false,
    },
    defaultPriority: {
      type: String,
      default: 'medium',
      enum: ['low', 'medium', 'high', 'urgent'],
    },
    allowAnonymousComplaints: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Ensure only one settings document exists
SettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne()
  if (!settings) {
    settings = await this.create({})
  }
  return settings
}

const Settings = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema)

export default Settings
