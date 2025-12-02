'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IUser } from '@/types'
import { UserRole } from '@/types/enums'
import { Edit, Trash2, Mail, Phone, MapPin, Building2, Calendar, Shield, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface ResidentListProps {
  residents: IUser[]
  onResidentsChange?: (residents: IUser[]) => void
  loading?: boolean
}

export default function ResidentList({ residents, onResidentsChange, loading = false }: ResidentListProps) {
  const [deletingResident, setDeletingResident] = useState<IUser | null>(null)

  const handleDeleteResident = async (resident: IUser) => {
    if (!confirm(`Are you sure you want to delete resident "${resident.name}"? This action cannot be undone.`)) {
      return
    }

    setDeletingResident(resident)

    try {
      const res = await fetch(`/api/users/${resident._id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        const updatedResidents = residents.filter(r => r._id !== resident._id)
        onResidentsChange?.(updatedResidents)
        toast.success('Resident deleted successfully')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to delete resident')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('An error occurred while deleting the resident')
    } finally {
      setDeletingResident(null)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (residents.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No residents found</h3>
        <p className="text-gray-500">Try adjusting your search criteria or add new residents.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {residents.map((resident) => (
        <div key={resident._id} className="p-6 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {resident.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Resident Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {resident.name}
                  </h3>
                  {resident.isActive ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{resident.email}</span>
                  </div>

                  {resident.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{resident.phone}</span>
                    </div>
                  )}

                  {resident.apartment && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Apt {resident.apartment}</span>
                    </div>
                  )}

                  {resident.building && (
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span>Building {resident.building}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(resident.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/residents/${resident._id}/edit`}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit resident"
              >
                <Edit className="w-4 h-4" />
              </Link>

              <button
                onClick={() => handleDeleteResident(resident)}
                disabled={deletingResident?._id === resident._id}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Delete resident"
              >
                {deletingResident?._id === resident._id ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
