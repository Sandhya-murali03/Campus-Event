# ⚡ Quick Start Guide - 5 Minutes to Running App

## Prerequisites
- Node.js installed
- MongoDB running

## 🚀 Super Fast Setup

### Step 1: Install Backend (2 minutes)
```bash
cd campus-event-management/backend
npm install
```

### Step 2: Install Frontend (2 minutes)
```bash
cd ../frontend
npm install
```

### Step 3: Start MongoDB (30 seconds)
```bash
# Make sure MongoDB is running
mongod
# or
sudo systemctl start mongod
```

### Step 4: Start Backend (30 seconds)
```bash
cd ../backend
npm run dev
```

**✅ You should see:** "MongoDB Connected" and "Server running on port 5000"

### Step 5: Start Frontend (30 seconds)
Open a **NEW terminal**:
```bash
cd campus-event-management/frontend
npm run dev
```

**✅ You should see:** "Local: http://localhost:3000/"

## 🎉 Access the App

Open browser: **http://localhost:3000**

## 👤 Test Login

### Create Test Accounts

1. Click "Register"
2. Create accounts with these roles:
   - **Student**: Fill form with role = Student
   - **Organizer**: Fill form with role = Organizer
   - **Committee**: Fill form with role = Committee
   - **Principal**: Fill form with role = Principal

### Quick Test Workflow

1. **Login as Organizer** → Create an event
2. **Login as Committee** → Approve the event
3. **Login as Principal** → Give final approval
4. **Login as Student** → Register for the event!

## 🎯 That's It!

Your Campus Event Management System is now running! 🎊

For detailed documentation, see:
- `README.md` - Full documentation
- `SETUP_GUIDE.md` - Detailed setup
- `FEATURES.md` - All features
- `PROJECT_SUMMARY.md` - Project overview

## 🆘 Common Issues

**MongoDB Error?**
```bash
# Make sure it's running
sudo systemctl status mongod
```

**Port 5000 in use?**
- Change PORT in `backend/.env` to 5001

**Port 3000 in use?**
- Frontend will auto-suggest another port (press Y)

## 📞 Need Help?

Check the detailed guides in the documentation files!

---

**Happy Event Managing! 🎓**
