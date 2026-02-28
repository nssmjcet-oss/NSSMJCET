# Quick Start Guide - NSS MJCET Website

Follow these steps to get the NSS MJCET website running on your local machine.

## Prerequisites

- Node.js 18 or higher installed
- MongoDB installed (or MongoDB Atlas account)

## Step-by-Step Setup

### 1. Install Dependencies

Open terminal and navigate to the project folder:

```bash
cd "/Users/mirzazohair/Documents/NSS Website"
npm install
```

This will install all required packages (Next.js, React, MongoDB, NextAuth, etc.)

### 2. Set Up Environment Variables

Create your environment file:

```bash
cp .env.example .env.local
```

Open `.env.local` in a text editor and update:

```env
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/nss-mjcet

# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nss-mjcet

# Generate a secret (run this in terminal: openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=paste-your-generated-secret-here

# Admin credentials (you can change these)
ADMIN_EMAIL=admin@nssmjcet.edu
ADMIN_PASSWORD=ChangeThisPassword123!
```

### 3. Start MongoDB (if using local)

```bash
# macOS
brew services start mongodb-community

# Or start manually
mongod --config /usr/local/etc/mongod.conf
```

### 4. Create Super Admin Account

```bash
npm run init-admin
```

You should see:
```
✅ Super admin created successfully!
📋 Login Credentials:
   Email: admin@nssmjcet.edu
   Password: ChangeThisPassword123!
```

### 5. Start Development Server

```bash
npm run dev
```

### 6. Open in Browser

Visit: http://localhost:3000

You should see the NSS MJCET homepage!

### 7. Login as Admin

1. Click "Login" in the navbar
2. Enter:
   - Email: admin@nssmjcet.edu
   - Password: ChangeThisPassword123!
3. Click "Login"

## What You Can Do Now

### Public Features (No Login Required)
- ✅ View homepage with NSS information
- ✅ Read About NSS page
- ✅ Submit volunteer registration
- ✅ Switch between English and Telugu

### Admin Features (After Login)
- ⚠️ Admin dashboard UI is not yet built
- ✅ API routes are ready for:
  - Creating users
  - Managing events
  - Managing activities
  - Viewing volunteer registrations

## Next Steps

The core infrastructure is complete! To finish the website, you need to create:

1. **Admin Dashboard Pages** - UI for managing content
2. **Public Pages** - Events, Activities, Gallery, Team, Contact
3. **Member Dashboard** - For NSS members to manage their content

See the [walkthrough.md](file:///Users/mirzazohair/.gemini/antigravity/brain/9bc0b9ba-5c2a-4fd7-aedd-c1c1598acfbf/walkthrough.md) for detailed next steps.

## Troubleshooting

### "Cannot connect to MongoDB"
- Make sure MongoDB is running: `brew services list`
- Check your MONGODB_URI in `.env.local`

### "Module not found" errors
- Run `npm install` again
- Delete `node_modules` and `.next` folders, then run `npm install`

### "NextAuth error"
- Make sure NEXTAUTH_SECRET is set in `.env.local`
- Generate a new secret: `openssl rand -base64 32`

### Port 3000 already in use
- Stop other applications using port 3000
- Or use a different port: `npm run dev -- -p 3001`

## Need Help?

- Check [README.md](file:///Users/mirzazohair/Documents/NSS%20Website/README.md) for detailed documentation
- Check [ADMIN_GUIDE.md](file:///Users/mirzazohair/Documents/NSS%20Website/ADMIN_GUIDE.md) for admin instructions
- Check [walkthrough.md](file:///Users/mirzazohair/.gemini/antigravity/brain/9bc0b9ba-5c2a-4fd7-aedd-c1c1598acfbf/walkthrough.md) for implementation details

---

**You're all set! 🎉**