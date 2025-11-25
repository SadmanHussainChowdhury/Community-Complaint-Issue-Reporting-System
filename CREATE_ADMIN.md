# Admin User Credentials

## Default Admin Credentials

Based on the `create-admin.ts` script, the default admin credentials are:

**Email:** `admin@example.com`  
**Password:** `admin123`

## To Create Admin User

If the admin user doesn't exist yet, you need to:

1. **Make sure MongoDB is connected** (update MONGODB_URI in .env.local)

2. **Run the create admin script:**
   ```bash
   npx ts-node scripts/create-admin.ts
   ```

   Or set custom credentials:
   ```bash
   $env:ADMIN_EMAIL="admin@example.com"
   $env:ADMIN_PASSWORD="admin123"
   npx ts-node scripts/create-admin.ts
   ```

3. **Sign in at:** http://localhost:3000/auth/signin

## Alternative: Create via API (if server is running)

You can also create an admin user by making a POST request to `/api/users` endpoint (requires authentication or you can temporarily modify the route to allow creation).

---

**⚠️ Important:** Change the default password after first login!

