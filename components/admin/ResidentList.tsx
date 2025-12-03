'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IUser } from '@/types'
import { Search, Edit, Trash2, Mail, Phone, Building, User } from 'lucide-react'
import toast from 'react-hot-toast'

interface ResidentListProps {
  residents: IUser[]
  onResidentsChange?: (residents: IUser[]) => void
  loading?: boolean
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export default function ResidentList({
  residents: initialResidents,
  onResidentsChange,
  loading: externalLoading = false,
  searchQuery: externalSearchQuery = '',
  onSearchChange
}: ResidentListProps) {
  const [residents, setResidents] = useState(initialResidents)
  const [deletingResident, setDeletingResident] = useState<IUser | null>(null)
  const [internalLoading, setInternalLoading] = useState(false)

  const loading = externalLoading || internalLoading

  const filteredResidents = residents.filter((resident) => {
    const matchesSearch = !externalSearchQuery ||
      resident.name.toLowerCase().includes(externalSearchQuery.toLowerCase()) ||
      resident.email.toLowerCase().includes(externalSearchQuery.toLowerCase()) ||
      resident.apartment?.toLowerCase().includes(externalSearchQuery.toLowerCase())
    return matchesSearch
  })

  const handleDeleteResident = async (resident: IUser) => {
    if (!confirm(`Are you sure you want to delete resident "${resident.name}"?`)) {
      return
    }

    setDeletingResident(resident)
    setInternalLoading(true)

    try {
      const res = await fetch(`/api/users/${resident._id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        const updatedResidents = residents.filter(r => r._id !== resident._id)
        setResidents(updatedResidents)
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
      setInternalLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search residents..."
              value={externalSearchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Residents Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resident
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-3">Loading residents...</span>
                  </div>
                </td>
              </tr>
            ) : filteredResidents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No residents found
                </td>
              </tr>
            ) : (
              filteredResidents.map((resident) => {
                return (
                  <tr key={resident._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {resident.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{resident.name}</div>
                          <div className="text-sm text-gray-500">{resident.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{resident.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {resident.apartment && `Apt ${resident.apartment}`}
                        {resident.building && `, Building ${resident.building}`}
                        {!resident.apartment && !resident.building && 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        resident.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {resident.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/users/${resident._id}`}
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit resident"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteResident(resident)}
                          disabled={deletingResident?._id === resident._id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Delete resident"
                        >
                          {deletingResident?._id === resident._id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
