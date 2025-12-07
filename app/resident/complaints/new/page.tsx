'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { ComplaintCategory, ComplaintPriority } from '@/types/enums'
import { Upload, X } from 'lucide-react'

export default function NewComplaintPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ComplaintCategory.OTHER,
    priority: ComplaintPriority.MEDIUM,
    building: '',
    floor: '',
    room: '',
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files)
      setImages([...images, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('priority', formData.priority)
      if (formData.building) formDataToSend.append('building', formData.building)
      if (formData.floor) formDataToSend.append('floor', formData.floor)
      if (formData.room) formDataToSend.append('room', formData.room)

      images.forEach((image) => {
        formDataToSend.append('images', image)
      })

      const res = await fetch('/api/complaints', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include'
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Complaint submitted successfully!')
        router.push('/resident/dashboard')
      } else {
        toast.error(data.error || 'Failed to submit complaint')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Submit New Complaint</h1>
        <p className="mt-2 text-gray-600">Report an issue or concern to the community management</p>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Brief description of the issue"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              required
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Provide detailed information about the issue"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ComplaintCategory })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {Object.values(ComplaintCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                id="priority"
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as ComplaintPriority })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {Object.values(ComplaintPriority).map((pri) => (
                  <option key={pri} value={pri}>
                    {pri.charAt(0).toUpperCase() + pri.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="building" className="block text-sm font-medium text-gray-700 mb-2">
                Building
              </label>
              <input
                type="text"
                id="building"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Building"
              />
            </div>

            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-2">
                Floor
              </label>
              <input
                type="text"
                id="floor"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Floor"
              />
            </div>

            <div>
              <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-2">
                Room
              </label>
              <input
                type="text"
                id="room"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Room"
              />
            </div>
          </div>

          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
              Images (Optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="images" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                    <span>Upload images</span>
                    <input
                      id="images"
                      name="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

