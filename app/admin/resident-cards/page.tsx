'use client'

import { useState, useEffect } from 'react'
import { Printer, Download, Layout, RotateCcw, Search, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { IUser } from '@/types'

export default function ResidentCardsPage() {
  const [residents, setResidents] = useState<IUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResidents, setSelectedResidents] = useState<IUser[]>([])
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [buildingFilter, setBuildingFilter] = useState('')

  useEffect(() => {
    fetchResidents()
  }, [])

  const fetchResidents = async () => {
    try {
      const response = await fetch('/api/users/residents?limit=1000') // Get all residents for card generation
      if (response.ok) {
        const data = await response.json()
        setResidents(data.data?.residents || [])
      } else {
        toast.error('Failed to fetch residents')
      }
    } catch (error) {
      console.error('Error fetching residents:', error)
      toast.error('Error loading residents')
    } finally {
      setLoading(false)
    }
  }

  const filteredResidents = residents.filter(resident => {
    const matchesSearch = !searchQuery ||
      resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.apartment?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesBuilding = !buildingFilter || resident.building === buildingFilter

    return matchesSearch && matchesBuilding
  })

  const handleResidentSelect = (resident: IUser) => {
    setSelectedResidents(prev =>
      prev.find(r => r._id === resident._id)
        ? prev.filter(r => r._id !== resident._id)
        : [...prev, resident]
    )
  }

  const handleSelectAll = () => {
    setSelectedResidents(prev =>
      prev.length === filteredResidents.length ? [] : filteredResidents
    )
  }

  const printCards = () => {
    if (selectedResidents.length === 0) {
      toast.error('Please select at least one resident')
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const cardsHtml = selectedResidents.map(resident => generateCardHtml(resident)).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Community Hub - Resident Cards</title>
          <style>
            @media print {
              body { margin: 0; }
              .card { page-break-inside: avoid; }
              .horizontal-cards { display: flex; flex-wrap: wrap; }
              .vertical-cards { display: block; }
              .horizontal-card { width: 48%; margin: 1%; }
            }
            body { font-family: Arial, sans-serif; }
            .card {
              border: 2px solid #000;
              margin: 10px;
              padding: 20px;
              border-radius: 8px;
              background: white;
            }
            .horizontal-card {
              display: inline-block;
              width: calc(50% - 20px);
              vertical-align: top;
            }
            .vertical-card {
              width: 100%;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .community-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .card-title {
              font-size: 18px;
              font-weight: bold;
            }
            .info-row {
              display: flex;
              margin-bottom: 8px;
            }
            .label {
              font-weight: bold;
              width: 120px;
              flex-shrink: 0;
            }
            .value {
              flex: 1;
            }
          </style>
        </head>
        <body>
          <div class="${orientation === 'horizontal' ? 'horizontal-cards' : 'vertical-cards'}">
            ${cardsHtml}
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const generateCardHtml = (resident: IUser) => {
    const cardClass = orientation === 'horizontal' ? 'horizontal-card' : 'vertical-card'

    return `
      <div class="card ${cardClass}">
        <div class="header">
          <div class="community-name">COMMUNITY HUB</div>
          <div class="card-title">RESIDENT CARD</div>
        </div>
        <div class="info-row">
          <span class="label">Name:</span>
          <span class="value">${resident.name}</span>
        </div>
        <div class="info-row">
          <span class="label">Email:</span>
          <span class="value">${resident.email}</span>
        </div>
        <div class="info-row">
          <span class="label">Phone:</span>
          <span class="value">${resident.phone || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="label">Building:</span>
          <span class="value">${resident.building || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="label">Apartment:</span>
          <span class="value">${resident.apartment || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="label">Status:</span>
          <span class="value">${resident.isActive ? 'Active' : 'Inactive'}</span>
        </div>
        <div class="info-row">
          <span class="label">Joined:</span>
          <span class="value">${new Date(resident.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    `
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Resident Cards</h1>
        <p className="mt-2 text-gray-600">Generate and print resident information cards</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search residents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Orientation Toggle */}
            <div className="flex items-center space-x-2">
              <Layout className="h-4 w-4 text-gray-500" />
              <button
                onClick={() => setOrientation('vertical')}
                className={`px-3 py-1 rounded ${orientation === 'vertical' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Vertical
              </button>
              <button
                onClick={() => setOrientation('horizontal')}
                className={`px-3 py-1 rounded ${orientation === 'horizontal' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Horizontal
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={printCards}
              disabled={selectedResidents.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="h-4 w-4" />
              <span>Print Cards ({selectedResidents.length})</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Building</label>
                <select
                  value={buildingFilter}
                  onChange={(e) => setBuildingFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Buildings</option>
                  <option value="A">Building A</option>
                  <option value="B">Building B</option>
                  <option value="C">Building C</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Residents List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={selectedResidents.length === filteredResidents.length && filteredResidents.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Select All ({filteredResidents.length} residents)
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {selectedResidents.length} selected
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredResidents.map((resident) => (
            <div key={resident._id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedResidents.some(r => r._id === resident._id)}
                  onChange={() => handleResidentSelect(resident)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{resident.name}</h3>
                      <p className="text-sm text-gray-500">{resident.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">
                        {resident.building && resident.apartment
                          ? `${resident.building} - ${resident.apartment}`
                          : 'No unit assigned'
                        }
                      </p>
                      <p className="text-sm text-gray-500">{resident.phone || 'No phone'}</p>
                    </div>
                  </div>
                </div>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  resident.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {resident.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredResidents.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No residents found matching your criteria.
          </div>
        )}
      </div>
    </div>
  )
}
