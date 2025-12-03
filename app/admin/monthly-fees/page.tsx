'use client'

import { useState, useEffect, useCallback } from 'react'
import { DollarSign, Plus, Search, Filter, Download, Edit, Trash2, CheckCircle2, XCircle, Calendar, User, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Pagination from '@/components/ui/Pagination'

interface MonthlyFee {
  _id: string
  resident: {
    _id: string
    name: string
    email: string
    phone?: string
    apartment?: string
    building?: string
  }
  month: number
  year: number
  amount: number
  description?: string
  status: 'pending' | 'paid' | 'overdue'
  dueDate: string
  paidDate?: string
  paymentMethod?: string
  paymentNotes?: string
  createdBy: {
    name: string
  }
}

interface FeeStats {
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  overdueAmount: number
  totalCount: number
  paidCount: number
  pendingCount: number
  overdueCount: number
}

export default function MonthlyFeesPage() {
  const [fees, setFees] = useState<MonthlyFee[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<FeeStats | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalFees, setTotalFees] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [monthFilter, setMonthFilter] = useState<string>('')
  const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString())
  const [showFilters, setShowFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingFee, setEditingFee] = useState<MonthlyFee | null>(null)
  const [residents, setResidents] = useState<any[]>([])

  const fetchFees = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      })

      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter) params.append('status', statusFilter)
      if (monthFilter) params.append('month', monthFilter)
      if (yearFilter) params.append('year', yearFilter)

      const response = await fetch(`/api/monthly-fees?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setFees(data.data.fees || [])
        setTotalFees(data.data.total || 0)
        setStats(data.data.stats || null)
      } else {
        toast.error('Failed to fetch monthly fees')
      }
    } catch (error) {
      console.error('Error fetching fees:', error)
      toast.error('Error loading monthly fees')
    } finally {
      setLoading(false)
    }
  }, [currentPage, itemsPerPage, searchQuery, statusFilter, monthFilter, yearFilter])

  const fetchResidents = async () => {
    try {
      const response = await fetch('/api/users/residents?limit=1000')
      if (response.ok) {
        const data = await response.json()
        setResidents(data.data?.residents || [])
      }
    } catch (error) {
      console.error('Error fetching residents:', error)
    }
  }

  useEffect(() => {
    fetchFees()
  }, [fetchFees])

  useEffect(() => {
    if (showAddModal || editingFee) {
      fetchResidents()
    }
  }, [showAddModal, editingFee])

  const handleMarkAsPaid = async (feeId: string) => {
    try {
      const response = await fetch(`/api/monthly-fees/${feeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'paid',
          paidDate: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        toast.success('Fee marked as paid')
        fetchFees()
      } else {
        toast.error('Failed to update fee')
      }
    } catch (error) {
      console.error('Error updating fee:', error)
      toast.error('Error updating fee')
    }
  }

  const handleDelete = async (feeId: string) => {
    if (!confirm('Are you sure you want to delete this monthly fee?')) return

    try {
      const response = await fetch(`/api/monthly-fees/${feeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Fee deleted successfully')
        fetchFees()
      } else {
        toast.error('Failed to delete fee')
      }
    } catch (error) {
      console.error('Error deleting fee:', error)
      toast.error('Error deleting fee')
    }
  }

  const handleExport = () => {
    const csvContent = [
      ['Resident', 'Month', 'Year', 'Amount', 'Status', 'Due Date', 'Paid Date', 'Description'].join(','),
      ...fees.map(fee => [
        `"${fee.resident.name}"`,
        fee.month,
        fee.year,
        fee.amount,
        fee.status,
        new Date(fee.dueDate).toLocaleDateString(),
        fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : '',
        `"${fee.description || ''}"`,
      ].join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `monthly-fees-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Fees exported successfully')
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Monthly Fees</h1>
            <p className="mt-2 text-gray-600">Manage monthly fees for residents</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-5 h-5" />
            <span>Add Fee</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalAmount.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">${stats.paidAmount.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{stats.paidCount} fees</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">${stats.pendingAmount.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{stats.pendingCount} fees</p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">${stats.overdueAmount.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{stats.overdueCount} fees</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by resident name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={monthFilter}
                  onChange={(e) => {
                    setMonthFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Months</option>
                  {monthNames.map((month, index) => (
                    <option key={index} value={(index + 1).toString()}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  value={yearFilter}
                  onChange={(e) => {
                    setYearFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  placeholder="Year"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fees Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : fees.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No monthly fees found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resident</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fees.map((fee) => (
                  <tr key={fee._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{fee.resident.name}</div>
                        <div className="text-sm text-gray-500">{fee.resident.email}</div>
                        {fee.resident.apartment && (
                          <div className="text-xs text-gray-400">{fee.resident.building} - {fee.resident.apartment}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{monthNames[fee.month - 1]} {fee.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${fee.amount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(fee.dueDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          fee.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : fee.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {fee.status !== 'paid' && (
                          <button
                            onClick={() => handleMarkAsPaid(fee._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Mark as Paid"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => setEditingFee(fee)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(fee._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalFees}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setItemsPerPage(size)
          setCurrentPage(1)
        }}
        showPageSizeSelector={true}
        showPageJump={true}
        loading={loading}
      />

      {/* Add/Edit Modal */}
      {(showAddModal || editingFee) && (
        <FeeModal
          fee={editingFee}
          residents={residents}
          onClose={() => {
            setShowAddModal(false)
            setEditingFee(null)
          }}
          onSuccess={() => {
            fetchFees()
            setShowAddModal(false)
            setEditingFee(null)
          }}
        />
      )}
    </div>
  )
}

// Fee Modal Component
function FeeModal({ fee, residents, onClose, onSuccess }: { fee: MonthlyFee | null; residents: any[]; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    residentId: fee?.resident._id || '',
    month: fee?.month || new Date().getMonth() + 1,
    year: fee?.year || new Date().getFullYear(),
    amount: fee?.amount || '',
    description: fee?.description || '',
    dueDate: fee?.dueDate ? new Date(fee.dueDate).toISOString().split('T')[0] : '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (fee) {
        // Update existing fee
        const response = await fetch(`/api/monthly-fees/${fee._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: formData.amount,
            description: formData.description,
            dueDate: formData.dueDate,
            month: formData.month,
            year: formData.year,
          }),
        })

        if (response.ok) {
          toast.success('Fee updated successfully')
          onSuccess()
        } else {
          const data = await response.json()
          toast.error(data.error || 'Failed to update fee')
        }
      } else {
        // Create new fee
        const response = await fetch('/api/monthly-fees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          toast.success('Fee created successfully')
          onSuccess()
        } else {
          const data = await response.json()
          toast.error(data.error || 'Failed to create fee')
        }
      }

    } catch (error) {
      console.error('Error saving fee:', error)
      toast.error('Error saving fee')
    } finally {
      setLoading(false)
    }
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{fee ? 'Edit Monthly Fee' : 'Add Monthly Fee'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resident *</label>
              <select
                value={formData.residentId}
                onChange={(e) => setFormData({ ...formData, residentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                required
                disabled={!!fee}
              >
                <option value="">Select resident</option>
                {residents.map((resident) => (
                  <option key={resident._id} value={resident._id}>
                    {resident.name} {resident.apartment && `(${resident.building} - ${resident.apartment})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  required
                >
                  {monthNames.map((month, index) => (
                    <option key={index} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  required
                  min="2020"
                  max="2100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : fee ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
