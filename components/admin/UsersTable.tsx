'use client'

import { useState } from 'react'
import { IUser } from '@/types'
import { UserRole } from '@/types/enums'
import UserList from '@/components/admin/UserList'
import Pagination from '@/components/ui/Pagination'

interface UsersTableProps {
  initialUsers: IUser[]
  initialTotal: number
  initialPage: number
  initialLimit: number
}

export default function UsersTable({
  initialUsers,
  initialTotal,
  initialPage,
  initialLimit
}: UsersTableProps) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [users, setUsers] = useState(initialUsers)
  const [loading, setLoading] = useState(false)

  const fetchUsers = async (page: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/users?page=${page}&limit=${initialLimit}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.data.users || [])
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    fetchUsers(page)
  }

  const handleUserUpdate = (updatedUsers: IUser[]) => {
    setUsers(updatedUsers)
  }

  return (
    <div className="space-y-6">
      <UserList users={users} onUsersChange={handleUserUpdate} />

      <Pagination
        currentPage={currentPage}
        totalItems={initialTotal}
        itemsPerPage={initialLimit}
        onPageChange={handlePageChange}
        showPageJump={initialTotal > 100}
        className="border-0 shadow-2xl bg-gradient-to-br from-white via-slate-50 to-white"
      />
    </div>
  )
}
