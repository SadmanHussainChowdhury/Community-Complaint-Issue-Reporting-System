import mongoose, { Schema, Model } from 'mongoose'
import { IComplaint, ComplaintNote } from '@/types'
import { ComplaintStatus, ComplaintPriority, ComplaintCategory } from '@/types/enums'

const ComplaintNoteSchema = new Schema<ComplaintNote>(
  {
    content: {
      type: String,
      required: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
)

const ComplaintSchema = new Schema<IComplaint>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(ComplaintCategory),
      required: [true, 'Category is required'],
    },
    priority: {
      type: String,
      enum: Object.values(ComplaintPriority),
      default: ComplaintPriority.MEDIUM,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ComplaintStatus),
      default: ComplaintStatus.PENDING,
      required: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    images: {
      type: [String],
      default: [],
    },
    location: {
      building: String,
      floor: String,
      room: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    communityId: {
      type: String,
      trim: true,
    },
    notes: {
      type: [ComplaintNoteSchema],
      default: [],
    },
    resolutionProof: {
      type: [String],
      default: [],
    },
    resolvedAt: {
      type: Date,
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        trim: true,
      },
      submittedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for better query performance
ComplaintSchema.index({ submittedBy: 1, createdAt: -1 })
ComplaintSchema.index({ assignedTo: 1, status: 1 })
ComplaintSchema.index({ status: 1, priority: 1 })
ComplaintSchema.index({ communityId: 1 })
ComplaintSchema.index({ category: 1 })

const Complaint: Model<IComplaint> =
  mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema)

export default Complaint

