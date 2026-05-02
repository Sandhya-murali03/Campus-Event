# 🎓 Campus Event Management System

A comprehensive full-stack MERN application for managing college events with role-based access control, approval workflows, automatic deadline handling, and Excel export functionality.

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based secure authentication
- Role-based access control (Student, Organizer, Committee, Principal)
- Protected routes and API endpoints
- Password hashing with bcrypt

### 🎯 Event Management
- **Organizers**: Create, edit, and delete events (before approval)
- **Committee**: Review and approve events, forward to Principal
- **Principal**: Final approval - makes events visible to all students
- **Students**: Browse and register for approved events

### 📋 Approval Workflow
1. Organizer creates event → Status: **Pending**
2. Committee approves → Status: **CommitteeApproved**
3. Principal approves → Status: **Approved**
   - Event becomes visible to all students
   - All students receive notification
   - Registration opens

### 🔔 Notification System
- Real-time notification bell with unread count
- Notification types: Event approval, rejection, registration success, deadline closed
- Mark as read/unread functionality
- Auto-notifications for all students when event is approved

### 📅 Automatic Deadline Handling
- Cron jobs check registration deadlines every hour
- Auto-close registration when deadline passes
- Automatic Excel generation of participants
- Notifications sent to organizer and participants

### 📊 Excel Export
- Automatic participant list generation using ExcelJS
- Styled Excel sheets with participant details
- Download functionality for organizers, committee, and principal
- Includes: Name, Email, Department, Year, Registration timestamp

### 📤 File Upload
- Event image upload (JPG, PNG, GIF, WEBP - max 5MB)
- Event PDF upload (max 10MB)
- Participant list upload capability
- Multer-based file handling

### 🎨 Modern UI/UX
- Gradient backgrounds (Blue → Purple)
- Glassmorphism design
- Responsive layout (mobile & desktop)
- Smooth animations and transitions
- Status badges with color coding
- Countdown timers for registration deadlines

### 👥 Role-Based Dashboards
- **Student**: Browse approved events, register, view registrations
- **Organizer**: Manage events, track participants, download Excel
- **Committee**: Review pending events, approve/reject
- **Principal**: Final approval authority

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload
- **ExcelJS** - Excel generation
- **node-cron** - Scheduled tasks

### Frontend
- **React.js** - UI library
- **React Router** - Navigation
- **Context API** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Toastify** - Notifications
- **React Icons** - Icons
- **date-fns** - Date formatting
- **Vite** - Build tool

## 📁 Project Structure

```
campus-event-management/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── registrationController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── Registration.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── registrationRoutes.js
│   │   └── notificationRoutes.js
│   ├── utils/
│   │   ├── fileUpload.js
│   │   ├── excelGenerator.js
│   │   └── cronJobs.js
│   ├── uploads/
│   │   ├── images/
│   │   └── pdfs/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── EventCard.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── CreateEvent.jsx
    │   │   ├── EventDetails.jsx
    │   │   ├── Notifications.jsx
    │   │   └── MyRegistrations.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd campus-event-management
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/campus_events
# JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
# JWT_EXPIRE=7d

# Start MongoDB (if not running)
# mongod

# Run the server
npm start

# For development with auto-reload
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

## 👤 Default Test Accounts

You can create accounts with these roles for testing:

- **Student**: student@example.com / password123
- **Organizer**: organizer@example.com / password123
- **Committee**: committee@example.com / password123
- **Principal**: principal@example.com / password123

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events (role-filtered)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (Organizer)
- `PUT /api/events/:id` - Update event (Organizer)
- `DELETE /api/events/:id` - Delete event (Organizer)
- `PUT /api/events/:id/committee-approve` - Committee approval
- `PUT /api/events/:id/principal-approve` - Principal approval
- `PUT /api/events/:id/reject` - Reject event
- `GET /api/events/:id/participants` - Get participants
- `GET /api/events/:id/download-participants` - Download Excel

### Registrations
- `POST /api/registrations/:eventId` - Register for event (Student)
- `DELETE /api/registrations/:eventId` - Cancel registration (Student)
- `GET /api/registrations/my-registrations` - Get user's registrations

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation
- Protected API routes
- File upload validation
- XSS protection

## 🎨 UI Components

### Gradient Backgrounds
- Blue to Purple gradient (`bg-gradient-blue-purple`)
- Glassmorphism cards with backdrop blur
- Smooth transitions and animations

### Status Badges
- **Pending**: Yellow
- **Committee Approved**: Blue
- **Approved**: Green
- **Rejected**: Red

### Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop grid layouts

## 📱 Features by Role

### Student
- View approved events
- Register for events
- View registration countdown
- Cancel registration (before event)
- View participant lists
- Receive notifications

### Organizer
- Create events with images
- Edit events (before approval)
- Delete pending events
- Upload PDFs and files
- Track participants
- Download Excel reports

### Committee
- Review pending events
- Approve and forward to Principal
- Reject with reason
- View all events

### Principal
- Final approval authority
- Approve/reject events
- View all events
- Access all reports

## 🔄 Workflow Example

1. **Organizer** creates "Tech Fest 2024" event
2. **System** sets status to "Pending", notifies Committee
3. **Committee** reviews and approves, forwards to Principal
4. **System** sets status to "CommitteeApproved", notifies Principal
5. **Principal** gives final approval
6. **System**:
   - Sets status to "Approved"
   - Makes event visible to all students
   - Sends notifications to all students
   - Opens registration
7. **Students** register for the event
8. **System** automatically:
   - Closes registration on deadline
   - Generates Excel file
   - Notifies organizer and participants

## 🛡️ Error Handling

- Comprehensive try-catch blocks
- User-friendly error messages
- Toast notifications for feedback
- Validation on both frontend and backend

## 🚀 Production Deployment

### Backend
1. Set up MongoDB Atlas or production database
2. Configure environment variables
3. Deploy to Heroku, AWS, or DigitalOcean
4. Set up process manager (PM2)

### Frontend
1. Build production bundle: `npm run build`
2. Deploy to Vercel, Netlify, or serve with backend

## 📄 License

MIT License

## 👨‍💻 Developer Notes

- All dates are handled with `date-fns` for consistency
- File uploads are stored in `uploads/` directory
- Cron jobs run automatically on server start
- Notifications are polled every 30 seconds on frontend
- Excel files are generated with styled headers
- Images are served as static files from backend

## 🐛 Known Issues & Future Enhancements

### Future Features
- Real-time notifications with WebSockets
- Event calendar view
- Email notifications
- QR code generation for events
- Event analytics dashboard
- Search and filter functionality
- Event categories management
- Attendance tracking

## 📞 Support

For issues and questions, please create an issue in the repository.

---

**Built with ❤️ using the MERN Stack**
