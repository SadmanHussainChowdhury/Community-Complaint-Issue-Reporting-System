export enum UserRole {
  RESIDENT = 'resident',
  STAFF = 'staff',
  ADMIN = 'admin',
}

export enum ComplaintStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
}

export enum ComplaintPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ComplaintCategory {
  MAINTENANCE = 'maintenance',
  SECURITY = 'security',
  CLEANLINESS = 'cleanliness',
  NOISE = 'noise',
  PARKING = 'parking',
  UTILITIES = 'utilities',
  SAFETY = 'safety',
  OTHER = 'other',
}

