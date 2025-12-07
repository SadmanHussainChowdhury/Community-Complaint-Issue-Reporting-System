'use client'

import { useState, useEffect } from 'react'
import { Printer, Search, X, CheckCircle2, Users, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { IUser } from '@/types'

export default function ResidentCardsPage() {
  const [residents, setResidents] = useState<IUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResidents, setSelectedResidents] = useState<IUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
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
      const response = await fetch('/api/users/residents?limit=1000')
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
      resident.apartment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleResidentSelect = (resident: IUser) => {
    setSelectedResidents(prev =>
      prev.find(r => r._id === resident._id)
        ? prev.filter(r => r._id !== resident._id)
        : [...prev, resident]
    )
  }

  const handleSelectAll = () => {
    if (selectedResidents.length === filteredResidents.length) {
      setSelectedResidents([])
      toast.success('All cards deselected')
    } else {
      setSelectedResidents([...filteredResidents])
      toast.success(`${filteredResidents.length} cards selected`)
    }
  }

  const handleClearSelection = () => {
    setSelectedResidents([])
    toast.success('Selection cleared')
  }

  const handleClearSearch = () => {
    setSearchQuery('')
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
          <title>${communityName} - Resident Identification Cards</title>
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
              @page {
                size: A4;
                margin: 10mm;
              }
            }

            * {
              box-sizing: border-box;
            }

            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f5f5f5;
              color: #1e293b;
              line-height: 1.5;
              margin: 0;
              padding: 20px;
            }

            .cards-container {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
              gap: 20px;
            }

            .card {
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              position: relative;
              width: 100%;
              max-width: 400px;
              margin: 0 auto;
            }

            .card-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding: 15px 20px;
              background: white;
              border-bottom: 2px solid #e5e7eb;
            }

            .community-logo {
              display: flex;
              flex-direction: column;
            }

            .logo-text {
              font-size: 18px;
              font-weight: 700;
              color: #1e293b;
              letter-spacing: -0.5px;
              margin-bottom: 2px;
            }

            .logo-subtitle {
              font-size: 10px;
              color: #6b7280;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .seal {
              width: 60px;
              height: 60px;
              border-radius: 50%;
              background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
              border: 3px solid #d97706;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 8px;
              font-weight: 600;
              text-align: center;
              line-height: 1.2;
              padding: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .seal-line1 {
              font-size: 7px;
              margin-bottom: 2px;
            }

            .seal-line2 {
              font-size: 6px;
            }

            .card-title-bar {
              background: #7c3aed;
              color: white;
              padding: 12px 20px;
              text-align: center;
              font-size: 14px;
              font-weight: 600;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }

            .card-body {
              padding: 20px;
            }

            .resident-info {
              margin-bottom: 15px;
            }

            .info-row {
              margin-bottom: 8px;
              font-size: 12px;
            }

            .info-label {
              font-weight: 600;
              color: #4b5563;
              margin-right: 5px;
            }

            .info-value {
              color: #1e293b;
              font-weight: 500;
            }

            .resident-photo-section {
              display: flex;
              justify-content: center;
              margin: 20px 0;
            }

            .resident-photo {
              width: 100px;
              height: 120px;
              background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid #e5e7eb;
              font-size: 48px;
              font-weight: 600;
              color: #6366f1;
              position: relative;
              overflow: hidden;
            }

            .resident-photo img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .resident-name {
              text-align: center;
              font-size: 16px;
              font-weight: 600;
              color: #1e293b;
              margin-top: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .barcode-section {
              padding: 15px 20px;
              background: #f9fafb;
              border-top: 1px solid #e5e7eb;
              display: flex;
              justify-content: center;
              align-items: center;
            }

            .barcode {
              font-family: 'Courier New', monospace;
              font-size: 20px;
              font-weight: 600;
              letter-spacing: 2px;
              color: #1e293b;
              padding: 8px 15px;
              background: white;
              border: 1px solid #d1d5db;
              border-radius: 4px;
            }

            @media (max-width: 640px) {
              .cards-container {
                grid-template-columns: 1fr;
              }
            }
          </style>
        </head>
        <body>
          <div class="cards-container">
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
    const initial = resident.name.charAt(0).toUpperCase()
    const residentId = resident._id.substring(0, 8).toUpperCase()
    const regDate = new Date(resident.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

    // Generate a simple barcode representation using the resident ID
    const barcode = resident._id.substring(0, 12).replace(/-/g, '').toUpperCase()

    return `
      <div class="card">
        <div class="card-header">
          <div class="community-logo">
            <div class="logo-text">${communityName}</div>
            <div class="logo-subtitle">COMMUNITY</div>
          </div>
          <div class="seal">
            <div class="seal-line1">QUALITY</div>
            <div class="seal-line2">APPROVED</div>
          </div>
        </div>

        <div class="card-title-bar">
          RESIDENT IDENTIFICATION CARD
        </div>

        <div class="card-body">
          <div class="resident-info">
            <div class="info-row">
              <span class="info-label">RESIDENT ID :</span>
              <span class="info-value">${residentId}</span>
            </div>
            <div class="info-row">
              <span class="info-label">REG. DATE :</span>
              <span class="info-value">${regDate}</span>
            </div>
          </div>

          <div class="resident-photo-section">
            <div class="resident-photo">
              ${initial}
            </div>
          </div>

          <div class="resident-name">
            ${resident.name.toUpperCase()}
          </div>
        </div>

        <div class="barcode-section">
          <div class="barcode">${barcode}</div>
        </div>
      </div>
    `
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading residents...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Professional Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search Residents
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or apartment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-500">
                Showing {filteredResidents.length} of {residents.length} residents
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cards Preview Grid - Centered */}
      {searchQuery && (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="w-full max-w-7xl">
            {filteredResidents.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center animate-fade-in">
                <div className="max-w-md mx-auto">
                  <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Search className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Residents Found</h3>
                  <p className="text-gray-600 mb-4">
                    No residents match your search criteria. Try adjusting your search terms.
                  </p>
                  <button
                    onClick={handleClearSearch}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Clear Search</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResidents.map((resident, index) => {
                  const initial = resident.name.charAt(0).toUpperCase()
                  const residentId = resident._id.substring(0, 8).toUpperCase()
                  const regDate = new Date(resident.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })
                  const barcode = resident._id.substring(0, 12).replace(/-/g, '').toUpperCase()

                  return (
                    <div
                      key={resident._id}
                      className="relative bg-white rounded-lg shadow-md overflow-hidden border-2 border-gray-200 hover:border-indigo-500 transition-all duration-300 animate-fade-in-up"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start p-4 border-b-2 border-gray-200 bg-white">
                        <div>
                          <div className="text-lg font-bold text-gray-900 leading-tight">{communityName}</div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">COMMUNITY</div>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-3 border-orange-600 flex flex-col items-center justify-center text-white text-[8px] font-bold text-center px-2 shadow-md flex-shrink-0">
                          <div className="leading-tight">QUALITY</div>
                          <div className="leading-tight">APPROVED</div>
                        </div>
                      </div>

                      {/* Purple Title Bar */}
                      <div className="bg-purple-600 text-white py-2.5 px-4 text-center text-sm font-semibold uppercase tracking-wide">
                        RESIDENT IDENTIFICATION CARD
                      </div>

                      {/* Card Body */}
                      <div className="p-5">
                        <div className="mb-4 space-y-1">
                          <div className="text-xs">
                            <span className="font-semibold text-gray-600">RESIDENT ID :</span>{' '}
                            <span className="text-gray-900">{residentId}</span>
                          </div>
                          <div className="text-xs">
                            <span className="font-semibold text-gray-600">REG. DATE :</span>{' '}
                            <span className="text-gray-900">{regDate}</span>
                          </div>
                        </div>

                        {/* Photo Section */}
                        <div className="flex justify-center my-4">
                          <div className="w-24 h-28 bg-gradient-to-br from-indigo-100 to-purple-100 rounded border-2 border-gray-300 flex items-center justify-center text-4xl font-bold text-indigo-600">
                            {initial}
                          </div>
                        </div>

                        {/* Name */}
                        <div className="text-center mt-3">
                          <div className="text-base font-semibold text-gray-900 uppercase tracking-wide">
                            {resident.name}
                          </div>
                        </div>
                      </div>

                      {/* Barcode Section */}
                      <div className="bg-gray-50 py-3 px-4 border-t border-gray-200">
                        <div className="flex justify-center">
                          <div className="font-mono text-sm font-bold tracking-widest text-gray-900 bg-white px-4 py-2 border border-gray-300 rounded">
                            {barcode}
                          </div>
                        </div>
                      </div>

                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
