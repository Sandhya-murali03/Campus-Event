# 📥 Download & Setup Instructions

## 🎯 You Have Downloaded: Campus Event Management System

**Complete MERN Stack Application** - Production Ready!

---

## 📦 What's Inside This Package

```
campus-event-management/
├── backend/              ← Node.js + Express + MongoDB Backend
├── frontend/             ← React + Vite + Tailwind Frontend
├── README.md             ← Main documentation
├── SETUP_GUIDE.md        ← Detailed setup instructions
├── QUICKSTART.md         ← 5-minute quick start
├── FEATURES.md           ← 200+ features list
├── DEPLOYMENT_GUIDE.md   ← Production deployment guide
└── PROJECT_SUMMARY.md    ← Project overview
```

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Extract the Archive

```bash
# If you downloaded .tar.gz
tar -xzf campus-event-management.tar.gz

# If you downloaded .zip
unzip campus-event-management.zip

# Navigate to folder
cd campus-event-management
```

### Step 2: Install Backend

```bash
cd backend
npm install
```

**Expected output**: Installing 15-20 packages (~30 seconds)

### Step 3: Install Frontend

```bash
cd ../frontend
npm install
```

**Expected output**: Installing 50-60 packages (~1-2 minutes)

### Step 4: Start MongoDB

**Option A - Local MongoDB:**
```bash
# Linux/Mac
sudo systemctl start mongod

# Mac (Homebrew)
brew services start mongodb-community

# Windows
# Start from Services or run:
"C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe"
```

**Option B - MongoDB Atlas (Cloud):**
1. Create free account: https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Update `backend/.env` with connection string

### Step 5: Configure Environment

The `.env` file is already created in `backend/` with default settings:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus_events
JWT_SECRET=campus_event_super_secret_key_change_in_production_12345
JWT_EXPIRE=7d
NODE_ENV=development
```

**For production**: Change `JWT_SECRET` to a strong random string!

### Step 6: Start Backend

```bash
cd backend
npm run dev
```

**✅ Success looks like:**
```
╔════════════════════════════════════════════════════════════════╗
║        Campus Event Management System - Backend Server        ║
║        Server running in development mode on port 5000         ║
╚════════════════════════════════════════════════════════════════╝

MongoDB Connected: localhost
Cron jobs started successfully
```

### Step 7: Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

**✅ Success looks like:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 8: Access Application

**Open browser:** http://localhost:3000

**You should see:** Beautiful login page with gradient background!

---

## 👤 Create Your First Account

1. **Click "Register here"**
2. **Fill in details:**
   - Name: Your Name
   - Email: student@test.com
   - Password: password123
   - Role: Student
   - Department: Computer Science
   - Year: 1
3. **Click "Create Account"**
4. **You're in!** 🎉

### Create Accounts for All Roles

To test the complete workflow, create 4 accounts:

1. **Student Account** (role: Student)
2. **Organizer Account** (role: Organizer)
3. **Committee Account** (role: Committee)
4. **Principal Account** (role: Principal)

---

## 🎯 Test the Complete Workflow

### 1. Login as Organizer
- Click "Create Event"
- Fill in event details
- Upload an image (optional)
- Submit
- **Status: Pending** ⏳

### 2. Login as Committee
- See pending event on dashboard
- Click "Approve"
- **Status: Committee Approved** ✅

### 3. Login as Principal
- See committee-approved event
- Click "Final Approve"
- **Status: Approved** 🎊
- **All students receive notification!**

### 4. Login as Student
- See approved event
- Check notification bell (🔔 with red badge)
- Click "Register Now"
- **Registered successfully!** ✨

---

## 📖 Documentation Files

All documentation is in the root folder:

1. **README.md** - Complete project documentation
   - Features overview
   - API endpoints
   - Database schema
   - Technology stack

2. **SETUP_GUIDE.md** - Detailed installation guide
   - Prerequisites
   - Step-by-step setup
   - Troubleshooting
   - Database configuration

3. **QUICKSTART.md** - Fast 5-minute setup
   - Quick commands
   - Test workflow
   - Common issues

4. **FEATURES.md** - All 200+ features
   - Complete feature list
   - Detailed descriptions
   - Implementation details

5. **DEPLOYMENT_GUIDE.md** - Production deployment
   - Heroku deployment
   - AWS EC2 deployment
   - DigitalOcean deployment
   - SSL setup
   - Domain configuration

6. **PROJECT_SUMMARY.md** - Project overview
   - Statistics
   - Architecture
   - Technology decisions

---

## 🔧 Common Issues & Solutions

### Issue: "MongoDB connection error"

**Solution:**
```bash
# Make sure MongoDB is running
sudo systemctl status mongod

# Start if not running
sudo systemctl start mongod
```

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill it
kill -9 <PID>

# Or change port in backend/.env
PORT=5001
```

### Issue: "Cannot find module"

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Frontend can't connect to backend"

**Solution:**
1. Make sure backend is running on port 5000
2. Check browser console for errors
3. Verify `vite.config.js` proxy settings

---

## 🎨 Features You Can Test

### ✅ Authentication
- Register with different roles
- Login/Logout
- Role-based dashboards

### ✅ Event Management
- Create events (Organizer)
- Upload images
- Edit events
- Delete events

### ✅ Approval Workflow
- Committee approval
- Principal approval
- Rejection with reason

### ✅ Registration System
- Register for events (Student)
- Cancel registration
- View "My Registrations"

### ✅ Notifications
- Real-time notification bell
- Unread count
- Click to view event
- Mark as read

### ✅ File Features
- Upload event images
- Upload PDFs
- Download participant Excel

### ✅ Automatic Features
- Registration auto-closes on deadline
- Excel auto-generated
- Notifications sent automatically

---

## 🚀 Ready for Production?

See **DEPLOYMENT_GUIDE.md** for:
- Heroku deployment (easiest)
- AWS EC2 deployment (full control)
- DigitalOcean deployment
- SSL certificate setup
- Domain configuration
- Production checklist

---

## 📊 Project Statistics

- **42 Files** created
- **20+ API Endpoints**
- **7 React Pages**
- **4 Database Models**
- **200+ Features**
- **5,000+ Lines of Code**

---

## 🎓 Tech Stack

**Backend:**
- Node.js v16+
- Express.js v4.18
- MongoDB v5+
- Mongoose v8.0
- JWT v9.0
- bcryptjs v2.4
- Multer v1.4
- ExcelJS v4.3
- node-cron v3.0

**Frontend:**
- React v18.2
- Vite v5.0
- Tailwind CSS v3.3
- React Router v6.20
- Axios v1.6
- React Toastify v9.1
- React Icons v4.12
- date-fns v2.30

---

## 📞 Need Help?

1. **Check Documentation Files** - All guides are included
2. **Review Console Logs** - Check terminal for errors
3. **Verify Prerequisites** - Node.js, MongoDB installed
4. **Test Connection** - Make sure MongoDB is running

---

## 🎉 You're All Set!

Your Campus Event Management System is ready to use!

**Next Steps:**
1. ✅ Complete local setup (5 minutes)
2. ✅ Test all features
3. ✅ Customize for your college
4. ✅ Deploy to production

**Enjoy managing campus events! 🎓**

---

**Questions or Issues?**
- Check the documentation files
- Review error logs
- Verify environment setup

**Happy Event Managing! 🚀**
