# Community Complaint & Issue Reporting System

A modern, full-featured web-based platform built with Next.js 14 (App Router), TypeScript, and MongoDB that allows residents, tenants, and community members to submit complaints, report issues, and maintain safety within apartments, neighborhoods, housing societies, and community-managed spaces.

## 🚀 Features

### Core Features

- **🔐 Secure Authentication System**
  - NextAuth.js with JWT and Credentials Provider
  - Password hashing with bcryptjs
  - Session management with secure cookies
  - Protected routes with middleware

- **👥 Role-Based Access Control (RBAC)**
  - **Residents**: Submit complaints, view their own complaints, track status
  - **Staff**: View assigned complaints, update progress, add notes, upload resolution proof
  - **Admin**: Full system access - manage users, assign complaints, override status, view analytics, create announcements

- **📋 Complaint Management**
  - Submit complaints with category, priority, description, and images
  - Optional location tracking (building, floor, room)
  - Workflow: Pending → In Progress → Resolved
  - Image uploads via Cloudinary
  - Real-time status updates

- **📢 Announcement System**
  - Admin can create and broadcast announcements
  - Target specific roles or all users
  - Pin important announcements
  - Attachment support
  - Expiration dates

- **📊 Analytics Dashboard**
  - Complaint statistics by status, category, and priority
  - Staff performance metrics
  - Recent complaints overview
  - Role-specific dashboards

- **🔄 Real-Time Updates**
  - Pusher integration for live updates
  - WebSocket-based notifications
  - Channel-based event system

- **📝 Activity Logging**
  - Comprehensive audit trail
  - Track all system actions
  - User activity monitoring

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Image Upload**: Cloudinary
- **Real-Time**: Pusher
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
community-issue/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth configuration
│   │   ├── complaints/              # Complaint API routes
│   │   ├── assignments/            # Assignment API routes
│   │   ├── announcements/          # Announcement API routes
│   │   ├── users/                   # User management API routes
│   │   └── dashboard/                # Dashboard statistics API
│   ├── admin/                       # Admin pages
│   │   └── dashboard/               # Admin dashboard
│   ├── staff/                       # Staff pages
│   │   └── dashboard/               # Staff dashboard
│   ├── resident/                    # Resident pages
│   │   ├── dashboard/               # Resident dashboard
│   │   └── complaints/              # Complaint submission
│   ├── auth/                        # Authentication pages
│   │   └── signin/                  # Sign in page
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Home page (redirects)
│   └── globals.css                  # Global styles
├── components/                      # Reusable React components
│   ├── Navbar.tsx
│   ├── ComplaintCard.tsx
│   └── StatsCard.tsx
├── lib/                            # Utility libraries
│   ├── mongodb.ts                  # MongoDB connection
│   ├── cloudinary.ts               # Cloudinary integration
│   ├── pusher.ts                   # Pusher configuration
│   └── utils.ts                     # Helper functions
├── models/                         # Mongoose models
│   ├── User.ts
│   ├── Complaint.ts
│   ├── Announcement.ts
│   ├── Assignment.ts
│   └── ActivityLog.ts
├── types/                          # TypeScript types
│   ├── index.ts                    # Main type definitions
│   └── enums.ts                    # Enum definitions
├── middleware.ts                   # Next.js middleware for auth
├── next.config.js                  # Next.js configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB Atlas account (or local MongoDB instance)
- Cloudinary account (for image uploads)
- Pusher account (for real-time features, optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SadmanHussainChowdhury/Community-Complaint-Issue-Reporting-System.git
   cd Community-Complaint-Issue-Reporting-System
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Copy `.env.local.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.local.example .env.local
   ```

   Required environment variables:
   ```env
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/community-issues?retryWrites=true&w=majority

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production-min-32-chars

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Pusher (Optional - for real-time updates)
   PUSHER_APP_ID=your-app-id
   PUSHER_KEY=your-key
   PUSHER_SECRET=your-secret
   PUSHER_CLUSTER=us2
   ```

4. **Generate NextAuth Secret**
   
   You can generate a secure secret using:
   ```bash
   openssl rand -base64 32
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Initial Setup

1. **Create an Admin User**
   
   You'll need to create an admin user directly in MongoDB or use a script. Here's a sample script:

   ```typescript
   // scripts/create-admin.ts
   import connectDB from '../lib/mongodb'
   import User from '../models/User'
   
   async function createAdmin() {
     await connectDB()
     await User.create({
       name: 'Admin User',
       email: 'admin@example.com',
       password: 'admin123',
       role: 'admin',
       isActive: true,
     })
     console.log('Admin user created!')
   }
   
   createAdmin()
   ```

2. **Access the Application**
   - Sign in with your admin credentials
   - Create additional users (residents, staff) through the admin panel
   - Start managing complaints!

## 📝 API Documentation

### Authentication

- `POST /api/auth/signin` - Sign in (handled by NextAuth)
- `GET /api/auth/session` - Get current session

### Complaints

- `GET /api/complaints` - Get all complaints (filtered by role)
  - Query params: `status`, `priority`, `category`, `assignedTo`, `page`, `limit`
- `POST /api/complaints` - Create new complaint (Residents)
  - Body: FormData with `title`, `description`, `category`, `priority`, `images`, `building`, `floor`, `room`
- `GET /api/complaints/[id]` - Get single complaint
- `PATCH /api/complaints/[id]` - Update complaint (role-based permissions)
- `DELETE /api/complaints/[id]` - Delete complaint (Admin only)

### Assignments

- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create assignment (Admin only)
  - Body: `complaintId`, `assignedTo`, `dueDate`, `notes`

### Announcements

- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement (Admin only)
  - Body: FormData with `title`, `content`, `isPinned`, `targetRoles`, `expiresAt`, `attachments`

### Users

- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `GET /api/users/[id]` - Get single user
- `PATCH /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user (Admin only)

### Dashboard

- `GET /api/dashboard` - Get dashboard statistics

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT-based session management
- Role-based route protection via middleware
- API route authentication checks
- Input validation and sanitization
- Secure file upload handling
- CORS protection
- XSS prevention

## 🎨 UI/UX Features

- Responsive design with Tailwind CSS
- Modern, clean interface
- Role-specific dashboards
- Real-time status updates
- Image preview and upload
- Toast notifications
- Loading states
- Error handling

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Update NEXTAUTH_URL**
   - Set `NEXTAUTH_URL` to your Vercel deployment URL

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for Vercel)
5. Get your connection string
6. Add to `MONGODB_URI` in environment variables

### Production Build

```bash
npm run build
npm start
```

## 📊 Database Models

### User Model
- `name`, `email`, `password`, `role`, `phone`, `apartment`, `building`, `communityId`, `isActive`

### Complaint Model
- `title`, `description`, `category`, `priority`, `status`, `submittedBy`, `assignedTo`, `images`, `location`, `notes`, `resolutionProof`, `resolvedAt`

### Announcement Model
- `title`, `content`, `createdBy`, `attachments`, `isPinned`, `targetRoles`, `expiresAt`

### Assignment Model
- `complaint`, `assignedTo`, `assignedBy`, `assignedAt`, `dueDate`, `status`, `notes`

### ActivityLog Model
- `user`, `action`, `entityType`, `entityId`, `details`, `communityId`

## 🔮 Premium Extensions (Optional)

The following features can be added as premium extensions:

1. **Multi-Community Support**
   - Tenant separation by community ID
   - Community-specific dashboards
   - Cross-community admin view

2. **SLA Timers & Escalation**
   - Automatic SLA tracking
   - Overdue complaint alerts
   - Escalation workflows

3. **Enhanced Announcements**
   - Rich text editor
   - Scheduled announcements
   - Read receipts

4. **Satisfaction Ratings**
   - Post-resolution surveys
   - Rating system
   - Feedback collection

5. **Polls & Voting**
   - Community polls
   - Voting system
   - Results visualization

6. **WhatsApp Integration**
   - Chatbot placeholder
   - Notification via WhatsApp
   - Complaint submission via WhatsApp

7. **Advanced Analytics**
   - Interactive charts with Recharts
   - Export reports
   - Custom date ranges
   - Trend analysis

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## 📄 License

This project is available for CodeCanyon submission and commercial use.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email support@example.com or create an issue in the repository.

## 🎯 Roadmap

- [ ] Email notifications
- [ ] SMS notifications
- [ ] Mobile app (React Native)
- [ ] Advanced reporting
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Export functionality
- [ ] API documentation (Swagger/OpenAPI)

## 📝 CodeCanyon Submission Notes

### Item Description
A complete, production-ready community complaint management system with role-based access, real-time updates, and comprehensive analytics.

### Features to Highlight
- ✅ Full TypeScript implementation
- ✅ Modern Next.js 14 App Router
- ✅ Secure authentication system
- ✅ Role-based access control
- ✅ Image upload with Cloudinary
- ✅ Real-time updates with Pusher
- ✅ Responsive design
- ✅ Production-ready code
- ✅ Comprehensive documentation
- ✅ Easy deployment to Vercel

### Requirements
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Pusher account (optional)

### Installation Time
~10-15 minutes

### Support
6 months of support included with purchase.

---

**Built with ❤️ using Next.js, TypeScript, and MongoDB**
