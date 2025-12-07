'use client'

import { useState, useEffect } from 'react'
import { Send, Mail, MessageSquare, Users, UserCheck, Building, CheckCircle2, XCircle } from 'lucide-react'
import { Loader } from '@/components/ui'
import toast from 'react-hot-toast'
import { IUser } from '@/types'

type RecipientType = 'all' | 'residents' | 'staff' | 'selected'
type MessageType = 'sms' | 'email' | 'both'

export default function SMSEmailBulkPage() {
  const [loading, setLoading] = useState(false)
  const [recipientType, setRecipientType] = useState<RecipientType>('all')
  const [messageType, setMessageType] = useState<MessageType>('both')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<IUser[]>([])
  const [users, setUsers] = useState<IUser[]>([])
  const [fetchingUsers, setFetchingUsers] = useState(false)
  const [sendProgress, setSendProgress] = useState<{ sent: number; total: number; failed: number } | null>(null)

  useEffect(() => {
    if (recipientType === 'selected' && users.length === 0) {
      fetchUsers()
    }
  }, [recipientType, users.length])

  const fetchUsers = async () => {
    setFetchingUsers(true)
    try {
      const response = await fetch('/api/users?limit=1000')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data?.users || [])
      } else {
        toast.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error loading users')
    } finally {
      setFetchingUsers(false)
    }
  }

  const handleUserToggle = (user: IUser) => {
    setSelectedUsers(prev =>
      prev.find(u => u._id === user._id)
        ? prev.filter(u => u._id !== user._id)
        : [...prev, user]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers([...users])
    }
  }

  const getRecipientCount = () => {
    switch (recipientType) {
      case 'all':
        return users.length
      case 'residents':
        return users.filter(u => u.role === 'resident').length
      case 'staff':
        return users.filter(u => u.role === 'staff').length
      case 'selected':
        return selectedUsers.length
      default:
        return 0
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      toast.error('Message is required')
      return
    }

    if (messageType === 'email' && !subject.trim()) {
      toast.error('Subject is required for emails')
      return
    }

    if (recipientType === 'selected' && selectedUsers.length === 0) {
      toast.error('Please select at least one recipient')
      return
    }

    setLoading(true)
    setSendProgress({ sent: 0, total: getRecipientCount(), failed: 0 })

    try {
      const response = await fetch('/api/sms-email-bulk/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientType,
          messageType,
          subject: messageType !== 'sms' ? subject : undefined,
          message,
          selectedUserIds: recipientType === 'selected' ? selectedUsers.map(u => u._id) : undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(
          `Successfully sent ${data.data.sent} ${messageType === 'both' ? 'messages' : messageType === 'sms' ? 'SMS' : 'emails'}!`
        )
        setSendProgress(null)
        setMessage('')
        setSubject('')
        setSelectedUsers([])
      } else {
        toast.error(data.error || 'Failed to send messages')
        setSendProgress(null)
      }
    } catch (error) {
      console.error('Error sending messages:', error)
      toast.error('An error occurred while sending messages')
      setSendProgress(null)
    } finally {
      setLoading(false)
    }
  }

  const recipientCount = getRecipientCount()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">SMS and Email Bulk</h1>
        <p className="mt-2 text-gray-600">Send bulk SMS and email messages to residents and staff</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Message Type Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Message Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setMessageType('sms')}
              className={`flex items-center justify-center space-x-2 p-4 border-2 rounded-lg transition-all ${
                messageType === 'sms'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">SMS Only</span>
            </button>
            <button
              type="button"
              onClick={() => setMessageType('email')}
              className={`flex items-center justify-center space-x-2 p-4 border-2 rounded-lg transition-all ${
                messageType === 'email'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Mail className="w-5 h-5" />
              <span className="font-medium">Email Only</span>
            </button>
            <button
              type="button"
              onClick={() => setMessageType('both')}
              className={`flex items-center justify-center space-x-2 p-4 border-2 rounded-lg transition-all ${
                messageType === 'both'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Send className="w-5 h-5" />
              <span className="font-medium">Both SMS & Email</span>
            </button>
          </div>
        </div>

        {/* Recipient Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recipients</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <button
              type="button"
              onClick={() => setRecipientType('all')}
              className={`flex items-center justify-center space-x-2 p-4 border-2 rounded-lg transition-all ${
                recipientType === 'all'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">All Users</span>
            </button>
            <button
              type="button"
              onClick={() => setRecipientType('residents')}
              className={`flex items-center justify-center space-x-2 p-4 border-2 rounded-lg transition-all ${
                recipientType === 'residents'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Building className="w-5 h-5" />
              <span className="font-medium">Residents Only</span>
            </button>
            <button
              type="button"
              onClick={() => setRecipientType('staff')}
              className={`flex items-center justify-center space-x-2 p-4 border-2 rounded-lg transition-all ${
                recipientType === 'staff'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span className="font-medium">Staff Only</span>
            </button>
            <button
              type="button"
              onClick={() => setRecipientType('selected')}
              className={`flex items-center justify-center space-x-2 p-4 border-2 rounded-lg transition-all ${
                recipientType === 'selected'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span className="font-medium">Select Users</span>
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{recipientCount}</strong> recipient{recipientCount !== 1 ? 's' : ''} will receive this message
            </p>
          </div>

          {/* User Selection Table */}
          {recipientType === 'selected' && (
            <div className="mt-6">
              <div className="bg-white rounded-lg shadow-md">
                {/* Filters */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-semibold text-gray-900">Select Users</h3>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>

                {/* Users Table */}
                {fetchingUsers ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader size="md" variant="primary" />
                    <span className="ml-3 text-gray-600">Loading users...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input
                              type="checkbox"
                              checked={selectedUsers.length === users.length && users.length > 0}
                              onChange={handleSelectAll}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                              No users found
                            </td>
                          </tr>
                        ) : (
                          users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedUsers.some(u => u._id === user._id)}
                                  onChange={() => handleUserToggle(user)}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                      <span className="text-white font-semibold">
                                        {user.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.phone || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                                  {user.role}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Message Composition */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Compose Message</h2>
          
          {messageType !== 'sms' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter email subject"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message <span className="text-red-500">*</span>
              {messageType === 'sms' && (
                <span className="text-xs text-gray-500 ml-2">(Max 160 characters for SMS)</span>
              )}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              maxLength={messageType === 'sms' ? 160 : undefined}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter your message here..."
              required
            />
            {messageType === 'sms' && (
              <p className="mt-1 text-xs text-gray-500">
                {message.length}/160 characters
              </p>
            )}
          </div>
        </div>

        {/* Send Progress */}
        {sendProgress && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Sending Progress</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">
                  {sendProgress.sent} / {sendProgress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(sendProgress.sent / sendProgress.total) * 100}%` }}
                />
              </div>
              {sendProgress.failed > 0 && (
                <p className="text-sm text-red-600">
                  {sendProgress.failed} failed to send
                </p>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || recipientCount === 0}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader size="sm" variant="white" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send {messageType === 'both' ? 'Messages' : messageType === 'sms' ? 'SMS' : 'Emails'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
