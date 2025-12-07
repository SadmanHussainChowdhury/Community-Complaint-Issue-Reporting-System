'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, UserCheck } from 'lucide-react'
import { Loader } from '@/components/ui'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Assignment</h1>
          <p className="mt-2 text-gray-600">Assign complaints to staff members</p>
        </div>
        <Link
          href="/admin/assignments"
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 inline-flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assignments</span>
        </Link>
      </div>

      <div className="max-w-4xl">
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
            <div>
              <label htmlFor="complaintId" className="block text-sm font-medium text-gray-700 mb-2">
                Select Complaint *
              </label>
              <select
                id="complaintId"
                required
                value={formData.complaintId}
                onChange={(e) => setFormData({ ...formData, complaintId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                disabled={complaintsLoading}
              >
                <option value="">
                  {complaintsLoading ? 'Loading complaints...' : 'Select a complaint'}
                </option>
                {complaints.map((complaint) => (
                  <option key={complaint._id} value={complaint._id}>
                    {complaint.title} - {complaint.category} ({complaint.priority})
                  </option>
                ))}
              </select>
              {complaints.length === 0 && !complaintsLoading && (
                <p className="text-sm text-gray-500 mt-1">No available complaints to assign</p>
              )}
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
                    <Loader size="sm" variant="white" />
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
