import mongoose, { Schema, Model } from 'mongoose'
import { IActivityLog } from '@/types'

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      enum: ['complaint', 'announcement', 'user', 'assignment'],
      required: true,
    },
    entityId: {
      type: String,
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    communityId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
ActivityLogSchema.index({ user: 1, createdAt: -1 })
ActivityLogSchema.index({ entityType: 1, entityId: 1 })
ActivityLogSchema.index({ communityId: 1, createdAt: -1 })

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema)

export default ActivityLog

