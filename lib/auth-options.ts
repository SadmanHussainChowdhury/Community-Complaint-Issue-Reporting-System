import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { UserRole } from '@/types/enums'
import { SessionUser } from '@/types'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password')
        }

        await connectDB()

        // Lowercase email to match User model's lowercase: true
        const email = credentials.email.toLowerCase().trim()
        const user = await User.findOne({ email }).select('+password')

        if (!user) {
          throw new Error('Invalid credentials or account is inactive')
        }

        if (!user.isActive) {
          throw new Error('Account is inactive. Please contact administrator.')
        }

        const isPasswordValid = await user.comparePassword(credentials.password)

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          communityId: user.communityId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.communityId = user.communityId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as SessionUser).id = token.id as string
        ;(session.user as SessionUser).role = token.role as UserRole
        ;(session.user as SessionUser).communityId = token.communityId as string | undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
