import { UserRole, ComplaintStatus, ComplaintPriority, ComplaintCategory } from './enums'

// User Types
export interface IUser {
  _id: string
  name: string
  email: string
  password: string
  role: UserRole
  phone?: string
  apartment?: string
  building?: string
  communityId?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserDocument extends IUser {
  comparePassword(candidatePassword: string): Promise<boolean>
}

// Complaint Types
export interface IComplaint {
  _id: string
  title: string
  description: string
  category: ComplaintCategory
  priority: ComplaintPriority
  status: ComplaintStatus
  submittedBy: string | IUser
  assignedTo?: string | IUser
  images: string[]
  location?: {
    building?: string
    floor?: string
    room?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  communityId?: string
  notes: ComplaintNote[]
  resolutionProof?: string[]
  resolvedAt?: Date
  feedback?: {
    rating?: number
    comment?: string
    submittedAt?: Date
  }
  createdAt: Date
  updatedAt: Date
}

export interface ComplaintNote {
  _id?: string
  content: string
  addedBy: string | IUser
  addedAt: Date
  isInternal: boolean
}

// Announcement Types
export interface IAnnouncement {
  _id: string
  title: string
  content: string
  createdBy: string | IUser
  communityId?: string
  attachments: string[]
  isPinned: boolean
  targetRoles?: UserRole[]
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Assignment Types
export interface IAssignment {
  _id: string
  complaint: string | IComplaint
  assignedTo: string | IUser
  assignedBy: string | IUser
  assignedAt: Date
  dueDate?: Date
  status: 'active' | 'completed' | 'cancelled'
  notes?: string
}

// Activity Log Types
export interface IActivityLog {
  _id: string
  user: string | IUser
  action: string
  entityType: 'complaint' | 'announcement' | 'user' | 'assignment'
  entityId: string
  details: Record<string, unknown>
  communityId?: string
  createdAt: Date
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Dashboard Analytics Types
export interface DashboardStats {
  totalComplaints: number
  pendingComplaints: number
  inProgressComplaints: number
  resolvedComplaints: number
  complaintsByCategory: Record<ComplaintCategory, number>
  complaintsByPriority: Record<ComplaintPriority, number>
  recentComplaints: IComplaint[]
  staffPerformance: {
    staffId: string
    staffName: string
    assignedCount: number
    resolvedCount: number
    averageResolutionTime: number
  }[]
}

// Form Types
export interface ComplaintFormData {
  title: string
  description: string
  category: ComplaintCategory
  priority: ComplaintPriority
  images?: File[]
  location?: {
    building?: string
    floor?: string
    room?: string
  }
}

export interface UserFormData {
  name: string
  email: string
  password?: string
  role: UserRole
  phone?: string
  apartment?: string
  building?: string
}

// Session Types
export interface SessionUser {
  id: string
  name?: string | null
  email?: string | null
  role: UserRole
  communityId?: string
}

