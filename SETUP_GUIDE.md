# 🚀 Complete Setup Guide

## Step-by-Step Installation

### 1. Prerequisites Check

Before starting, ensure you have:

```bash
# Check Node.js version (should be v16+)
node --version

# Check npm version
npm --version

# Check MongoDB installation
mongod --version
```

If any are missing, install them:
- **Node.js**: https://nodejs.org/
- **MongoDB**: https://www.mongodb.com/try/download/community

### 2. MongoDB Setup

#### Option A: Local MongoDB

```bash
# Start MongoDB service
# On Linux/Mac:
sudo systemctl start mongod

# On Mac with Homebrew:
brew services start mongodb-community

# On Windows:
# Start MongoDB from Services or run:
"C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe"

# Verify MongoDB is running:
mongosh
```

#### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get connection string
5. Update backend `.env` with:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campus_events
   ```

### 3. Backend Installation

```bash
cd campus-event-management/backend

# Install all dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your settings
nano .env  # or use any text editor
```

**.env Configuration:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus_events
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_123456
JWT_EXPIRE=7d
NODE_ENV=development
```

**Start Backend:**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        Campus Event Management System - Backend Server        ║
║                                                                ║
║        Server running in development mode on port 5000         ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

MongoDB Connected: localhost
Cron jobs started successfully
```

### 4. Frontend Installation

Open a **new terminal window**:

```bash
cd campus-event-management/frontend

# Install all dependencies
npm install

# Start development server
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 5. Access the Application

Open your browser and go to: **http://localhost:3000**

## 🧪 Testing the Application

### 1. Create Test Users

Use the registration page or MongoDB shell:

```bash
mongosh

use campus_events

# Create a test student (password will be hashed automatically when using the app)
```

Better approach - use the **Register** page in the app:

1. Go to http://localhost:3000/register
2. Create accounts with different roles:
   - Student account
   - Organizer account
   - Committee account
   - Principal account

### 2. Test Workflow

**As Organizer:**
1. Login with organizer account
2. Click "Create Event"
3. Fill in event details:
   - Title: "Tech Fest 2024"
   - Description: "Annual technology festival"
   - Venue: "Main Auditorium"
   - Event Date: Select a future date
   - Registration Deadline: Select a date before event date
   - Upload an image (optional)
4. Click "Create Event"
5. Event is now in "Pending" status

**As Committee:**
1. Logout and login with committee account
2. See the pending event on dashboard
3. Click "Approve" button
4. Event status changes to "Committee Approved"

**As Principal:**
1. Logout and login with principal account
2. See the committee-approved event
3. Click "Final Approve"
4. Event is now approved and visible to all students
5. All students receive notifications

**As Student:**
1. Logout and login with student account
2. See the approved event on dashboard
3. Click "Register Now"
4. Registration successful!
5. View your registrations in "My Registrations"

### 3. Test Notifications

1. Login as any user
2. Click the bell icon (🔔) in navbar
3. See all notifications
4. Click on a notification to view event
5. Mark notifications as read

### 4. Test File Downloads

**As Organizer:**
1. Login and view one of your approved events
2. Click "View Details"
3. Scroll to participants section
4. Click "Download Excel"
5. Excel file with all participants downloads

## 🔧 Troubleshooting

### MongoDB Connection Error

**Error:** `MongoNetworkError: connect ECONNREFUSED`

**Solution:**
```bash
# Make sure MongoDB is running
sudo systemctl status mongod

# Start if not running
sudo systemctl start mongod
```

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### Frontend Not Connecting to Backend

**Error:** `Network Error` or `ERR_CONNECTION_REFUSED`

**Solution:**
1. Make sure backend is running on port 5000
2. Check `vite.config.js` proxy settings
3. Restart frontend dev server

### File Upload Not Working

**Issue:** Images/PDFs not uploading

**Solution:**
```bash
# Create upload directories
cd backend
mkdir -p uploads/images uploads/pdfs

# Check permissions
chmod 755 uploads
chmod 755 uploads/images
chmod 755 uploads/pdfs
```

### Cron Jobs Not Running

**Issue:** Registration deadlines not auto-closing

**Solution:**
- Check server logs for cron job start message
- Cron jobs run every hour - wait for next execution
- Manually trigger by restarting backend server

### Excel Download Not Working

**Issue:** Excel file download fails

**Solution:**
```bash
# Make sure exceljs is installed
cd backend
npm install exceljs

# Check uploads/pdfs directory exists
ls -la uploads/pdfs
```

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (student|organizer|committee|principal),
  department: String,
  year: String (only for students),
  createdAt: Date
}
```

### Events Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  venue: String,
  eventDate: Date,
  lastRegistrationDate: Date,
  status: String (Pending|CommitteeApproved|Approved|Rejected),
  createdBy: ObjectId (ref: User),
  registrationClosed: Boolean,
  image: String (path),
  participantsList: String (path),
  eventPdf: String (path),
  maxParticipants: Number,
  category: String,
  rejectionReason: String,
  committeeApprovedBy: ObjectId,
  principalApprovedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Registrations Collection
```javascript
{
  _id: ObjectId,
  event: ObjectId (ref: Event),
  user: ObjectId (ref: User),
  registeredAt: Date,
  status: String (registered|cancelled)
}
```

### Notifications Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  message: String,
  event: ObjectId (ref: Event),
  type: String,
  isRead: Boolean,
  createdAt: Date
}
```

## 🔐 Security Best Practices

1. **Never commit .env file**
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   ```

2. **Change JWT_SECRET in production**
   ```bash
   # Generate a secure secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Use HTTPS in production**

4. **Set strong password requirements**

5. **Rate limiting** (add to backend if needed)

## 🎯 Next Steps

1. ✅ Complete installation
2. ✅ Test all features
3. ✅ Create sample data
4. 📝 Customize for your college
5. 🚀 Deploy to production

## 📞 Need Help?

- Check the main README.md
- Review error logs in terminal
- Check MongoDB logs
- Verify all dependencies are installed

Happy coding! 🎉
