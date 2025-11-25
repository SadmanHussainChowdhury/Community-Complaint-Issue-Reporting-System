# Codebase Structure

This document provides a detailed overview of the project structure and organization.

## Directory Structure

```
community-issue/
├── app/                          # Next.js App Router directory
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/    # NextAuth configuration
│   │   ├── complaints/           # Complaint API endpoints
│   │   │   └── [id]/            # Individual complaint routes
│   │   ├── assignments/          # Assignment API endpoints
│   │   ├── announcements/        # Announcement API endpoints
│   │   ├── users/                # User management API
│   │   │   └── [id]/            # Individual user routes
│   │   └── dashboard/            # Dashboard statistics API
│   ├── admin/                    # Admin pages
│   │   └── dashboard/            # Admin dashboard
│   ├── staff/                    # Staff pages
│   │   └── dashboard/            # Staff dashboard
│   ├── resident/                 # Resident pages
│   │   ├── dashboard/            # Resident dashboard
│   │   └── complaints/           # Complaint pages
│   │       └── new/             # New complaint form
│   ├── auth/                     # Authentication pages
│   │   ├── signin/              # Sign in page
│   │   └── error/               # Auth error page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (redirects)
│   ├── providers.tsx            # Session provider
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── Navbar.tsx               # Navigation bar
│   ├── ComplaintCard.tsx        # Complaint card component
│   └── StatsCard.tsx            # Statistics card component
├── lib/                         # Utility libraries
│   ├── mongodb.ts               # MongoDB connection
│   ├── cloudinary.ts            # Cloudinary integration
│   ├── pusher.ts                # Pusher configuration
│   └── utils.ts                 # Helper functions
├── models/                      # Mongoose models
│   ├── User.ts                  # User model
│   ├── Complaint.ts             # Complaint model
│   ├── Announcement.ts          # Announcement model
│   ├── Assignment.ts            # Assignment model
│   └── ActivityLog.ts           # Activity log model
├── types/                       # TypeScript types
│   ├── index.ts                 # Main type definitions
│   └── enums.ts                 # Enum definitions
├── scripts/                     # Utility scripts
│   └── create-admin.ts          # Admin user creation script
├── middleware.ts                # Next.js middleware
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS config
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies
├── .env.local.example          # Environment variables template
├── .gitignore                  # Git ignore rules
├── README.md                   # Main documentation
├── DEPLOYMENT.md               # Deployment guide
├── FEATURES.md                 # Feature list
└── CODEBASE_STRUCTURE.md       # This file
```

## Key Files Explained

### App Router Structure

#### `/app/api/`
All API routes follow Next.js 13+ App Router conventions:
- `route.ts` files export HTTP method handlers (GET, POST, PATCH, DELETE)
- Type-safe with TypeScript
- Server-side only

#### `/app/[role]/dashboard/`
Role-specific dashboard pages:
- Admin: Full system overview
- Staff: Assigned complaints
- Resident: Personal complaints

### Components

#### `Navbar.tsx`
- Role-based navigation
- Session management
- Sign out functionality

#### `ComplaintCard.tsx`
- Displays complaint information
- Status and priority badges
- Image preview
- Action buttons

#### `StatsCard.tsx`
- Reusable statistics display
- Icon support
- Color variants

### Models

All models use Mongoose with TypeScript:
- Strong typing
- Validation
- Indexes for performance
- Virtual methods
- Pre/post hooks

### Types

#### `types/index.ts`
- Main type definitions
- Interface exports
- API response types

#### `types/enums.ts`
- User roles
- Complaint statuses
- Priorities
- Categories

### Libraries

#### `lib/mongodb.ts`
- Connection pooling
- Caching
- Error handling

#### `lib/cloudinary.ts`
- Image upload
- Image deletion
- Optimization

#### `lib/pusher.ts`
- Real-time event triggers
- Channel management
- Event constants

#### `lib/utils.ts`
- Utility functions
- Date formatting
- Color helpers
- Class name merging

## Code Organization Principles

1. **Separation of Concerns**
   - API routes separate from UI
   - Models separate from business logic
   - Components are reusable

2. **Type Safety**
   - Full TypeScript coverage
   - Type definitions for all entities
   - API response types

3. **Modularity**
   - Each feature in its own directory
   - Reusable components
   - Shared utilities

4. **Scalability**
   - Easy to add new features
   - Clear structure
   - Well-documented

## Adding New Features

### New API Route
1. Create `app/api/[feature]/route.ts`
2. Add type definitions in `types/index.ts`
3. Create model if needed in `models/`
4. Update documentation

### New Page
1. Create directory in `app/[role]/[page]/`
2. Add `page.tsx`
3. Update navigation in `Navbar.tsx`
4. Add route protection if needed

### New Component
1. Create file in `components/`
2. Export from component file
3. Use TypeScript interfaces
4. Add to component library

## Best Practices

1. **Always use TypeScript**
   - No `any` types
   - Proper interfaces
   - Type exports

2. **Error Handling**
   - Try-catch blocks
   - Proper error messages
   - User-friendly feedback

3. **Security**
   - Validate inputs
   - Check permissions
   - Sanitize data

4. **Performance**
   - Use indexes
   - Optimize queries
   - Cache when appropriate

5. **Documentation**
   - Comment complex logic
   - Document functions
   - Update README

---

**This structure is designed for scalability and maintainability.**

