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
  const [communityName, setCommunityName] = useState('Community Hub')

  useEffect(() => {
    fetchResidents()
    fetchCommunityName()
  }, [])

  const fetchCommunityName = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.communityName) {
          setCommunityName(data.data.communityName)
        }
      }
    } catch (error) {
      console.error('Error fetching community name:', error)
    }
  }

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

    const cardsHtml = selectedResidents.map(resident => generateCardHtml(resident, communityName)).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${communityName} - Resident Information Cards</title>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

            @media print {
              body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              .card {
                page-break-inside: avoid;
                page-break-after: always;
              }
              .horizontal-cards {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
              }
              .vertical-cards {
                display: block;
              }
              .horizontal-card {
                width: calc(50% - 10px);
                flex-shrink: 0;
              }
              @page {
                size: A4;
                margin: 15mm;
              }
            }

            * {
              box-sizing: border-box;
            }

            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f8fafc;
              color: #1e293b;
              line-height: 1.5;
              margin: 0;
              padding: 20px;
            }

            .print-header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #e2e8f0;
            }

            .print-title {
              font-size: 28px;
              font-weight: 700;
              color: #0f172a;
              margin: 0;
              letter-spacing: -0.025em;
            }

            .print-subtitle {
              font-size: 14px;
              color: #64748b;
              margin: 5px 0 0 0;
              font-weight: 500;
            }

            .cards-container {
              display: flex;
              flex-direction: column;
              gap: 25px;
            }

            .horizontal-cards {
              flex-direction: row;
              flex-wrap: wrap;
              gap: 25px;
            }

            .card {
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              border: 1px solid #e2e8f0;
              overflow: hidden;
              position: relative;
            }

            .card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #3b82f6, #1d4ed8);
            }

            .card-header {
              background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
              color: white;
              padding: 20px;
              text-align: center;
              position: relative;
            }

            .card-header::after {
              content: '';
              position: absolute;
              bottom: -10px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 10px solid transparent;
              border-right: 10px solid transparent;
              border-top: 10px solid #1e40af;
            }

            .community-logo {
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 4px;
              letter-spacing: -0.025em;
            }

            .card-type {
              font-size: 12px;
              font-weight: 500;
              opacity: 0.9;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }

            .card-body {
              padding: 25px;
            }

            .resident-photo {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px auto;
              border: 3px solid #e2e8f0;
              font-size: 32px;
              font-weight: 600;
              color: #64748b;
            }

            .resident-name {
              font-size: 20px;
              font-weight: 600;
              color: #0f172a;
              text-align: center;
              margin-bottom: 20px;
            }

            .info-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 12px;
            }

            .info-row {
              display: flex;
              align-items: center;
              padding: 8px 12px;
              background: #f8fafc;
              border-radius: 6px;
              border: 1px solid #e2e8f0;
            }

            .info-icon {
              width: 16px;
              height: 16px;
              margin-right: 12px;
              color: #64748b;
              flex-shrink: 0;
            }

            .info-content {
              flex: 1;
              min-width: 0;
            }

            .info-label {
              font-size: 11px;
              font-weight: 600;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 2px;
              display: block;
            }

            .info-value {
              font-size: 14px;
              font-weight: 500;
              color: #0f172a;
              word-break: break-word;
            }

            .status-badge {
              display: inline-flex;
              align-items: center;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }

            .status-active {
              background: #dcfce7;
              color: #166534;
            }

            .status-inactive {
              background: #fef2f2;
              color: #dc2626;
            }

            .card-footer {
              background: #f8fafc;
              padding: 15px 25px;
              border-top: 1px solid #e2e8f0;
              text-align: center;
            }

            .footer-text {
              font-size: 10px;
              color: #64748b;
              font-weight: 500;
              margin: 0;
            }

            .emergency-note {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 6px;
              padding: 12px;
              margin-top: 15px;
              text-align: center;
            }

            .emergency-text {
              font-size: 12px;
              color: #92400e;
              font-weight: 600;
              margin: 0;
            }

            @media (max-width: 640px) {
              .horizontal-card {
                width: 100% !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1 class="print-title">🏥 ${communityName}</h1>
            <p class="print-subtitle">Resident Information Cards - ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="cards-container ${orientation === 'horizontal' ? 'horizontal-cards' : 'vertical-cards'}">
            ${cardsHtml}
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const generateCardHtml = (resident: IUser, communityName: string) => {
    const cardClass = orientation === 'horizontal' ? 'horizontal-card' : 'vertical-card'
    const initial = resident.name.charAt(0).toUpperCase()

    return `
      <div class="card ${cardClass}">
        <div class="card-header">
          <div class="community-logo">🏢 ${communityName}</div>
          <div class="card-type">Resident Information Card</div>
        </div>

        <div class="card-body">
          <div class="resident-photo">${initial}</div>
          <h2 class="resident-name">${resident.name}</h2>

          <div class="info-grid">
            <div class="info-row">
              <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
              </svg>
              <div class="info-content">
                <span class="info-label">Email Address</span>
                <span class="info-value">${resident.email}</span>
              </div>
            </div>

            <div class="info-row">
              <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              <div class="info-content">
                <span class="info-label">Phone Number</span>
                <span class="info-value">${resident.phone || 'Not provided'}</span>
              </div>
            </div>

            <div class="info-row">
              <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              <div class="info-content">
                <span class="info-label">Building & Unit</span>
                <span class="info-value">${resident.building || 'N/A'} ${resident.apartment || ''}</span>
              </div>
            </div>

            <div class="info-row">
              <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <div class="info-content">
                <span class="info-label">Member Since</span>
                <span class="info-value">${new Date(resident.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</span>
              </div>
            </div>

            <div class="info-row">
              <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="info-content">
                <span class="info-label">Status</span>
                <span class="status-badge ${resident.isActive ? 'status-active' : 'status-inactive'}">
                  ${resident.isActive ? '✓ Active Resident' : '✗ Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <p class="footer-text">${communityName} Management System</p>
          <div class="emergency-note">
            <p class="emergency-text">🆘 Emergency Contact: Call Security at Ext. 911</p>
          </div>
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

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
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

      {/* Residents Table */}
      <div className="bg-white rounded-lg shadow-md">
        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search residents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {showFilters && (
              <select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Buildings</option>
                <option value="A">Building A</option>
                <option value="B">Building B</option>
                <option value="C">Building C</option>
              </select>
            )}
          </div>
        </div>

        {/* Residents Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedResidents.length === filteredResidents.length && filteredResidents.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No residents found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredResidents.map((resident) => (
                  <tr key={resident._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedResidents.some(r => r._id === resident._id)}
                        onChange={() => handleResidentSelect(resident)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
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
                        {resident.building && resident.apartment
                          ? `Building ${resident.building}, Apt ${resident.apartment}`
                          : 'N/A'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        resident.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {resident.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
