'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, UserCheck, Search, X, ChevronDown, Check } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { IComplaint, IUser } from '@/types'

export default function AdminNewAssignmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [complaintsLoading, setComplaintsLoading] = useState(true)
  const [staffLoading, setStaffLoading] = useState(true)
  const [complaints, setComplaints] = useState<IComplaint[]>([])
  const [staff, setStaff] = useState<IUser[]>([])
  const [complaintSearchQuery, setComplaintSearchQuery] = useState('')
  const [showComplaintDropdown, setShowComplaintDropdown] = useState(false)
  const complaintDropdownRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    complaintId: '',
    assignedTo: '',
    dueDate: '',
    notes: '',
  })

  // Fetch unassigned complaints and staff
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch complaints (pending and in progress, unassigned or assigned to current staff)
        const complaintsRes = await fetch('/api/complaints?status=pending&status=in_progress', {
          credentials: 'include'
        })
        const complaintsData = await complaintsRes.json()
        if (complaintsData.success) {
          setComplaints(complaintsData.data.complaints || [])
        }

        // Fetch staff users
        const staffRes = await fetch('/api/users', {
          credentials: 'include'
        })
        const staffData = await staffRes.json()
        if (staffData.success) {
          const staffUsers = staffData.data.users.filter((user: IUser) => user.role === 'staff')
          setStaff(staffUsers)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setComplaintsLoading(false)
        setStaffLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter complaints based on search query
  const filteredComplaints = useMemo(() => {
    if (!complaintSearchQuery.trim()) {
      return complaints
    }

    const query = complaintSearchQuery.toLowerCase()
    return complaints.filter(complaint => 
      complaint.title.toLowerCase().includes(query) ||
      complaint.description.toLowerCase().includes(query) ||
      complaint.category.toLowerCase().includes(query) ||
      complaint.priority.toLowerCase().includes(query) ||
      complaint.status.toLowerCase().includes(query)
    )
  }, [complaints, complaintSearchQuery])

  // Get selected complaint details
  const selectedComplaint = useMemo(() => {
    return complaints.find(c => c._id === formData.complaintId)
  }, [complaints, formData.complaintId])

  const handleComplaintSelect = (complaintId: string) => {
    setFormData({ ...formData, complaintId })
    setShowComplaintDropdown(false)
    setComplaintSearchQuery('')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (complaintDropdownRef.current && !complaintDropdownRef.current.contains(event.target as Node)) {
        setShowComplaintDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Assignment created successfully!')
        router.push('/admin/assignments')
      } else {
        toast.error(data.error || 'Failed to create assignment')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
        <Link
          href="/admin/assignments"
                className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
        >
                <ArrowLeft className="w-5 h-5" />
          <span>Back to Assignments</span>
        </Link>
            </div>
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Create Assignment</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <UserCheck className="w-6 h-6 text-gray-400" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">New Assignment</h2>
                <p className="text-sm text-gray-600">Assign complaints to staff members</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="relative" ref={complaintDropdownRef}>
              <label htmlFor="complaintId" className="block text-sm font-medium text-gray-700 mb-2">
                Select Complaint *
              </label>
              
              {/* Custom Searchable Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowComplaintDropdown(!showComplaintDropdown)}
                  className="w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white flex items-center justify-between"
                  disabled={complaintsLoading}
                >
                  <span className={formData.complaintId ? 'text-gray-900' : 'text-gray-500'}>
                    {complaintsLoading 
                      ? 'Loading complaints...' 
                      : selectedComplaint 
                        ? `${selectedComplaint.title} - ${selectedComplaint.category} (${selectedComplaint.priority})`
                        : 'Select Complaint *'
                    }
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showComplaintDropdown ? 'transform rotate-180' : ''}`} />
                </button>

                {/* Dropdown Panel */}
                {showComplaintDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search by title, description, category, priority, or status..."
                          value={complaintSearchQuery}
                          onChange={(e) => setComplaintSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                          autoFocus
                        />
                        {complaintSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setComplaintSearchQuery('')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {complaintSearchQuery && (
                        <p className="text-xs text-gray-500 mt-2">
                          {filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? 's' : ''} found
                        </p>
                      )}
                    </div>

                    {/* Complaints Table */}
                    <div className="overflow-y-auto max-h-64">
                      {complaintsLoading ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Loading complaints...</p>
                        </div>
                      ) : filteredComplaints.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                          {complaintSearchQuery ? 'No complaints match your search' : 'No available complaints to assign'}
                        </div>
                      ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredComplaints.map((complaint) => (
                              <tr
                                key={complaint._id}
                                onClick={() => handleComplaintSelect(complaint._id)}
                                className={`cursor-pointer hover:bg-primary-50 transition-colors ${
                                  formData.complaintId === complaint._id ? 'bg-primary-50' : ''
                                }`}
                              >
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {formData.complaintId === complaint._id && (
                                    <Check className="w-4 h-4 text-primary-600" />
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm font-medium text-gray-900">{complaint.title}</div>
                                  <div className="text-xs text-gray-500 truncate max-w-xs">{complaint.description}</div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 capitalize">
                                  {complaint.category.replace('_', ' ')}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    complaint.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                    complaint.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                    complaint.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1).replace('_', ' ')}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Hidden input for form validation */}
              <input
                type="hidden"
                id="complaintId"
                name="complaintId"
                value={formData.complaintId}
                required
              />
            </div>

            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Staff Member *
              </label>
              <select
                id="assignedTo"
                required
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                disabled={staffLoading}
              >
                <option value="">
                  {staffLoading ? 'Loading staff...' : 'Select a staff member'}
                </option>
                {staff.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} - {member.email}
                  </option>
                ))}
              </select>
              {staff.length === 0 && !staffLoading && (
                <p className="text-sm text-gray-500 mt-1">No staff members available</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="datetime-local"
                  id="dueDate"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Additional instructions or notes for the staff member..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Assignment Details</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>The staff member will receive a notification about this assignment</li>
                      <li>The complaint status will be updated to &ldquo;In Progress&rdquo;</li>
                      <li>You can track progress in the assignments dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Link
                href="/admin/assignments"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.complaintId || !formData.assignedTo}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Create Assignment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
