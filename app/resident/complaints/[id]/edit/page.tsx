'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { IComplaint } from '@/types'
import { ComplaintPriority, ComplaintCategory } from '@/types/enums'
import { Save, ArrowLeft, Upload, X } from 'lucide-react'
import { Loader } from '@/components/ui'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface FormData {
  title: string
  description: string
  category: ComplaintCategory
  priority: ComplaintPriority
  images: File[]
  existingImages: string[]
}

export default function EditComplaintPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [complaint, setComplaint] = useState<IComplaint | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: ComplaintCategory.OTHER,
    priority: ComplaintPriority.MEDIUM,
    images: [],
    existingImages: []
  })

  const loadComplaint = useCallback(async () => {
    try {
      const res = await fetch(`/api/complaints/${params.id}`, {
        credentials: 'include'
      })
      const data = await res.json()

      if (data.success) {
        const complaintData = data.data.complaint
        setComplaint(complaintData)
        setFormData({
          title: complaintData.title,
          description: complaintData.description,
          category: complaintData.category,
          priority: complaintData.priority,
          images: [],
          existingImages: complaintData.images || []
        })
      } else {
        toast.error(data.error || 'Failed to load complaint')
        router.push('/resident/dashboard')
      }
    } catch (error) {
      toast.error('An error occurred')
      router.push('/resident/dashboard')
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    if (session) {
      loadComplaint()
    }
  }, [session, loadComplaint])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }))
  }

  const removeNewImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const removeExistingImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter(img => img !== imageUrl)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('category', formData.category)
      submitData.append('priority', formData.priority)
      submitData.append('existingImages', JSON.stringify(formData.existingImages))

      // Add new images
      formData.images.forEach((image, index) => {
        submitData.append(`images`, image)
      })

      const res = await fetch(`/api/complaints/${params.id}`, {
        method: 'PATCH',
        body: submitData,
        credentials: 'include'
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Complaint updated successfully!')
        router.push(`/resident/complaints/${params.id}`)
      } else {
        toast.error(data.error || 'Failed to update complaint')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('An error occurred while updating the complaint')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader size="md" variant="primary" />
          </div>
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Complaint Not Found</h1>
            <p className="text-gray-600">The complaint you&apos;re trying to edit doesn&apos;t exist or you don&apos;t have permission to edit it.</p>
          </div>
        </div>
      </div>
    )
  }

  // Check if complaint can be edited (not resolved)
  if (complaint.status === 'resolved') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Cannot Edit Resolved Complaint</h1>
            <p className="text-gray-600">This complaint has been resolved and cannot be edited.</p>
            <button
              onClick={() => router.push('/resident/dashboard')}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Complaint</h1>
          <p className="mt-2 text-gray-600">Update your complaint details</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Brief description of your complaint"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value={ComplaintCategory.MAINTENANCE}>Maintenance</option>
                <option value={ComplaintCategory.SECURITY}>Security</option>
                <option value={ComplaintCategory.NOISE}>Noise</option>
                <option value={ComplaintCategory.CLEANLINESS}>Cleanliness</option>
                <option value={ComplaintCategory.OTHER}>Other</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value={ComplaintPriority.LOW}>Low</option>
                <option value={ComplaintPriority.MEDIUM}>Medium</option>
                <option value={ComplaintPriority.HIGH}>High</option>
                <option value={ComplaintPriority.URGENT}>Urgent</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Detailed description of your complaint"
                required
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images
              </label>

              {/* Existing Images */}
              {formData.existingImages.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Images:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.existingImages.map((image, index) => (
                      <div key={index} className="relative">
                        <div className="relative h-24 w-full rounded overflow-hidden border">
                          <Image
                            src={image}
                            alt={`Current image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(image)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              {formData.images.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">New Images:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <div className="relative h-24 w-full rounded overflow-hidden border">
                          <Image
                            src={URL.createObjectURL(image)}
                            alt={`New image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div>
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Add Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">You can upload multiple images (max 5MB each)</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader size="sm" variant="white" />}
                <Save className="w-4 h-4" />
                Update Complaint
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
