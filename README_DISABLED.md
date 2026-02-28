# NSS MJCET Official Website

Modern, bilingual, CMS-driven official website for NSS MJCET with comprehensive admin controls and role-based access management.

## 🚀 Features

- ✅ **Bilingual Support** - Complete English and Telugu language support
- ✅ **Admin Dashboard** - Full CMS control for super admin
- ✅ **Role-Based Access Control (RBAC)** - Granular permissions for team members
- ✅ **Event Management** - Create, edit, and publish events
- ✅ **Activity Tracking** - Log and showcase NSS activities
- ✅ **Gallery Management** - Upload and organize images
- ✅ **Volunteer Registration** - Public registration form
- ✅ **Contact System** - Contact form with admin management
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **Modern UI** - Clean, professional, government-grade design

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB database (local or MongoDB Atlas)
- Basic command line knowledge

## 🛠️ Installation

### Step 1: Install Dependencies

```bash
cd "/Users/mirzazohair/Documents/NSS Website"
npm install
```

### Step 2: Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/nss-mjcet
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/nss-mjcet

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-change-this

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Initial Super Admin
ADMIN_EMAIL=admin@nssmjcet.edu
ADMIN_PASSWORD=ChangeThisPassword123!
```

**Important:** Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### Step 3: Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB (macOS)
brew install mongodb-community
brew services start mongodb-community

# Verify it's running
mongosh
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env.local`

### Step 4: Create Initial Super Admin

Run the initialization script:

```bash
npm run init-admin
```

This will create the first super admin account using credentials from `.env.local`.

### Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 👤 Default Login

After running `npm run init-admin`, login with:

- **Email:** admin@nssmjcet.edu (or your ADMIN_EMAIL)
- **Password:** ChangeThisPassword123! (or your ADMIN_PASSWORD)

**⚠️ IMPORTANT:** Change the default password immediately after first login!

## 📁 Project Structure

```
NSS Website/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # Authentication
│   │   ├── admin/           # Admin endpoints
│   │   ├── volunteer/       # Public volunteer registration
│   │   └── contact/         # Public contact form
│   ├── admin/               # Admin dashboard pages
│   ├── member/              # Member dashboard pages
│   ├── about/               # Public pages
│   ├── events/
│   ├── activities/
│   └── ...
├── components/              # Reusable React components
├── contexts/                # React contexts (Language, etc.)
├── lib/                     # Utilities (DB, RBAC, etc.)
├── models/                  # MongoDB models
├── styles/                  # Global styles and variables
└── utils/                   # Helper functions

```

## 🔐 User Roles & Permissions

### Super Admin
- Full access to everything
- Create/edit/delete users
- Manage all content
- Assign permissions to members

### Member
- Limited access based on assigned permissions
- Can edit only assigned modules
- Can update own profile picture
- Cannot access admin-only features

## 📖 Admin Guide

See [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) for detailed instructions on:
- Creating member accounts
- Assigning permissions
- Managing content
- Editing bilingual content

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

```bash
# Or use Vercel CLI
npm install -g vercel
vercel
```

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `.next` folder to Netlify

### Self-Hosted

Requirements:
- Node.js 18+
- MongoDB
- Process manager (PM2 recommended)

```bash
# Build for production
npm run build

# Start with PM2
npm install -g pm2
pm2 start npm --name "nss-mjcet" -- start
```

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run init-admin   # Create initial super admin
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Verify MongoDB is running: `mongosh`
- Check `MONGODB_URI` in `.env.local`
- For Atlas, whitelist your IP address

### NextAuth Error
- Ensure `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your domain

### Build Errors
- Delete `.next` folder and `node_modules`
- Run `npm install` again
- Run `npm run build`

## 📞 Support

For issues or questions:
- Email: nss@mjcet.ac.in
- Check the [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)

## 📄 License

© 2026 NSS MJCET. All rights reserved.

---

**Built By Mirza Zohair Ali Baig for NSS MJCET**