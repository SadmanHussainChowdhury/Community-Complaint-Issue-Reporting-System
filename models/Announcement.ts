import mongoose, { Schema, Model } from 'mongoose'
import { IAnnouncement } from '@/types'
import { UserRole } from '@/types/enums'

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    communityId: {
      type: String,
      trim: true,
    },
    attachments: {
      type: [String],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    targetRoles: {
      type: [String],
      enum: Object.values(UserRole),
      default: [],
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
AnnouncementSchema.index({ communityId: 1, createdAt: -1 })
AnnouncementSchema.index({ isPinned: 1, createdAt: -1 })
AnnouncementSchema.index({ expiresAt: 1 })

const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema)

export default Announcement

