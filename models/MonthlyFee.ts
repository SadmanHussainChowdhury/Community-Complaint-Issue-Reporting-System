import mongoose, { Schema, Document } from 'mongoose'
import { IUser } from '@/types'

export interface IMonthlyFee extends Document {
  resident: mongoose.Types.ObjectId | IUser
  month: number // 1-12
  year: number
  amount: number
  description?: string
  status: 'pending' | 'paid' | 'overdue'
  dueDate: Date
  paidDate?: Date
  paymentMethod?: string
  paymentNotes?: string
  createdBy: mongoose.Types.ObjectId
  communityId?: string
  createdAt: Date
  updatedAt: Date
}

const MonthlyFeeSchema = new Schema<IMonthlyFee>(
  {
    resident: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    paymentNotes: {
      type: String,
      trim: true,
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
  },
  {
    timestamps: true,
  }
)

// Indexes
MonthlyFeeSchema.index({ resident: 1, year: 1, month: 1 }, { unique: true })
MonthlyFeeSchema.index({ status: 1, dueDate: 1 })
MonthlyFeeSchema.index({ year: 1, month: 1 })

const MonthlyFee = mongoose.models.MonthlyFee || mongoose.model<IMonthlyFee>('MonthlyFee', MonthlyFeeSchema)

export default MonthlyFee
