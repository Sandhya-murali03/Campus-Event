# 🚀 Production Deployment Guide

## 📦 Download & Extract

### Option 1: Download Archive
```bash
# Download the compressed archive
wget [YOUR_DOWNLOAD_URL]

# Extract
tar -xzf campus-event-management.tar.gz

# Navigate to project
cd campus-event-management
```

### Option 2: Clone from Repository
```bash
git clone <repository-url>
cd campus-event-management
```

## 🔧 Local Development Setup

### Prerequisites
- Node.js v16 or higher
- MongoDB v5 or higher
- npm or yarn

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# In backend/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus_events
JWT_SECRET=your_production_secret_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access: http://localhost:3000

## 🌐 Production Deployment Options

### Option 1: Deploy to Heroku

#### Backend Deployment

```bash
cd backend

# Login to Heroku
heroku login

# Create app
heroku create campus-events-backend

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your_super_secret_key_here
heroku config:set NODE_ENV=production

# Create Procfile
echo "web: node server.js" > Procfile

# Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

#### Frontend Deployment (Vercel)

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Update vite.config.js to point to Heroku backend
# Change proxy target to your Heroku backend URL

# Build
npm run build

# Deploy
vercel
```

### Option 2: Deploy to AWS EC2

#### 1. Launch EC2 Instance
- Ubuntu 22.04 LTS
- t2.micro (free tier)
- Open ports: 80, 443, 22, 5000 (temporarily)

#### 2. SSH into Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### 3. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### 4. Upload Project

```bash
# On your local machine
scp -i your-key.pem -r campus-event-management ubuntu@your-ec2-ip:~/

# Or use git
ssh -i your-key.pem ubuntu@your-ec2-ip
git clone <your-repo-url>
```

#### 5. Setup Backend

```bash
cd campus-event-management/backend

# Install dependencies
npm install --production

# Create .env
nano .env
# Add:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/campus_events
# JWT_SECRET=your_production_secret
# JWT_EXPIRE=7d
# NODE_ENV=production

# Start with PM2
pm2 start server.js --name campus-events-backend
pm2 save
pm2 startup
```

#### 6. Build & Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Update API URL in src/services/api.js
# Change to your EC2 public IP or domain

# Build for production
npm run build

# Copy build to Nginx
sudo cp -r dist/* /var/www/html/
```

#### 7. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/default
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or EC2 IP

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:5000;
    }
}
```

```bash
# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 8. Setup SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Option 3: Deploy to DigitalOcean

#### Using App Platform (Easiest)

1. **Create DigitalOcean Account**
2. **Create App**
   - Connect GitHub repository
   - Detect both backend and frontend
3. **Configure Backend**
   - Build Command: `npm install`
   - Run Command: `node server.js`
   - Add environment variables
4. **Add MongoDB Database**
   - Create managed MongoDB cluster
   - Copy connection string to backend env
5. **Configure Frontend**
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. **Deploy**

#### Using Droplet (Manual)

Similar to AWS EC2 setup above.

### Option 4: Deploy to Netlify (Frontend) + Render (Backend)

#### Backend on Render

1. Go to https://render.com
2. Create Web Service
3. Connect repository
4. Configure:
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Add environment variables
5. Add MongoDB Atlas connection string

#### Frontend on Netlify

1. Go to https://netlify.com
2. Drag and drop `frontend/dist` folder
3. Or connect GitHub repo
4. Build settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
5. Update API URL to Render backend URL

## 🗄️ Database Setup

### MongoDB Atlas (Recommended for Production)

1. **Create Account**: https://www.mongodb.com/cloud/atlas
2. **Create Cluster** (Free tier available)
3. **Configure Access**:
   - Database Access: Create user
   - Network Access: Add IP (0.0.0.0/0 for all)
4. **Get Connection String**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/campus_events
   ```
5. **Update Backend .env**:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campus_events
   ```

## 📋 Pre-Deployment Checklist

### Security
- [ ] Change JWT_SECRET to strong random string
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Remove .env from git
- [ ] Set secure MongoDB credentials

### Configuration
- [ ] Update frontend API URLs
- [ ] Configure proper MongoDB connection
- [ ] Set up environment variables
- [ ] Configure file upload limits
- [ ] Set up proper logging

### Testing
- [ ] Test all user roles
- [ ] Test approval workflow
- [ ] Test file uploads
- [ ] Test Excel downloads
- [ ] Test notifications
- [ ] Test on mobile devices

### Performance
- [ ] Build frontend for production
- [ ] Enable gzip compression
- [ ] Configure caching headers
- [ ] Optimize images
- [ ] Set up CDN (optional)

## 🔐 Production Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=very_strong_random_secret_key_minimum_32_characters
JWT_EXPIRE=7d
NODE_ENV=production
```

### Frontend
Update `vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://your-backend-url.com', // Your production backend
        changeOrigin: true,
      }
    }
  }
})
```

## 📊 Monitoring & Maintenance

### PM2 Commands (Backend)
```bash
pm2 status                  # Check status
pm2 logs campus-events-backend  # View logs
pm2 restart campus-events-backend  # Restart
pm2 stop campus-events-backend     # Stop
pm2 delete campus-events-backend   # Remove
```

### MongoDB Backup
```bash
# Backup
mongodump --uri="your_mongodb_uri" --out=/backup/campus-events

# Restore
mongorestore --uri="your_mongodb_uri" /backup/campus-events
```

### Log Management
```bash
# Backend logs with PM2
pm2 logs --lines 100

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check connection string
- Verify network access in MongoDB Atlas
- Ensure MongoDB service is running

**CORS Errors**
- Update backend CORS configuration
- Add frontend domain to allowed origins

**File Upload Not Working**
- Check upload directory permissions: `chmod 755 uploads/`
- Verify Nginx file size limit
- Check backend file size limits

**Build Errors**
- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`
- Clear cache: `npm cache clean --force`

## 📱 Domain & SSL Setup

### Configure Domain
1. Buy domain (Namecheap, GoDaddy, etc.)
2. Point to server IP:
   - A Record: @ → Your Server IP
   - A Record: www → Your Server IP
3. Wait for DNS propagation (up to 48 hours)

### Setup SSL with Let's Encrypt
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 🎯 Post-Deployment

1. **Test Everything**
   - Register users with all roles
   - Create test event
   - Test complete approval workflow
   - Verify notifications
   - Test file uploads
   - Test Excel downloads

2. **Monitor**
   - Check server logs regularly
   - Monitor database size
   - Track API response times
   - Monitor disk space

3. **Backup**
   - Set up automated MongoDB backups
   - Backup uploaded files regularly
   - Keep backups in separate location

## 🚀 CI/CD (Optional)

### GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ubuntu
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd campus-event-management
            git pull
            cd backend && npm install && pm2 restart campus-events-backend
            cd ../frontend && npm install && npm run build && sudo cp -r dist/* /var/www/html/
```

## 📞 Support

For deployment issues:
- Check server logs
- Review Nginx/Apache error logs
- Verify environment variables
- Test MongoDB connection
- Check firewall rules

---

**Your Campus Event Management System is ready for production! 🎉**
