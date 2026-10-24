# InternDesk

InternDesk uses a React/Vite frontend, an Express API, and MySQL. In development, Vite forwards /api and /health requests to the API on port 5000.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MySQL 8.0+
- Docker (optional, for containerized MySQL)

### Option 1: Quick Setup with SQL Import (Recommended)

1. **Import the database:**
   ```bash
   # Run the automated setup script
   setup-database.bat
   
   # Or manually:
   mysql -u root -p < server/interndesk.sql
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

3. **Configure environment:**
   ```bash
   cd server
   copy .env.example .env
   # Edit .env with your MySQL credentials
   ```

4. **Start the servers:**
   ```bash
   # Terminal 1 - API Server
   cd server && npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:5173
   - API: http://localhost:5000
   - Admin login: admin@interndesk.in

### Option 2: Docker Setup

1. **Start MySQL with Docker:**
   ```bash
   cd server
   npm run db:up
   ```

2. **Import database:**
   ```bash
   mysql -u root -p interndesk < interndesk.sql
   ```

3. **Follow steps 2-5 from Option 1**

---

## 📊 Database

### Pre-populated Data

The server/interndesk.sql file includes:
- ✅ **Admin Account**: admin@interndesk.in (role: admin)
- ✅ **Sample Companies**: 2 companies with profiles
- ✅ **Sample Users**: Multiple students and recruiters
- ✅ **Sample Internships**: Active job postings
- ✅ **7 Tables**: Complete schema with relationships

### Database Schema

| Table | Description |
|-------|-------------|
| users | Student, company, and admin accounts |
| companies | Company profiles and verification status |
| internships | Job/internship postings |
| applications | Student applications with status tracking |
| application_messages | Chat between students and recruiters |
| notifications | System notifications |
| resume_assets | Uploaded resumes (base64 encoded) |

### Manual Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE interndesk;"

# Import schema and data
mysql -u root -p interndesk < server/interndesk.sql

# Verify import
mysql -u root -p interndesk -e "SHOW TABLES;"
```

For detailed database setup instructions, see [DATABASE_SETUP.md](DATABASE_SETUP.md)

---

## 🔧 Configuration

### Environment Variables (server/.env)

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=interndesk

# Security (use random 32+ character strings)
PASSWORD_PEPPER=your_random_pepper_here
OTP_PEPPER=your_random_otp_pepper_here
JWT_SECRET=your_jwt_secret_here

# Email (Brevo)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=InternDesk

# Admin Seed
ADMIN_SEED_KEY=interndesk-admin-2024

# Optional
NODE_ENV=development
PORT=5000
```

### Create Admin Account

```bash
# Using seed endpoint
curl -X POST http://localhost:5000/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@interndesk.in","name":"Admin","secretKey":"interndesk-admin-2024"}'
```

---

## 🎯 Features

### For Students
- Browse and search internships
- Apply with resume upload
- Track application status
- Save favorite listings
- Receive notifications

### For Companies
- Post internship opportunities
- Review applications
- Message candidates
- Track hiring pipeline
- Company profile management

### For Admins
- Dashboard with statistics
- Review and approve job postings
- Verify companies
- Manage users
- Platform notifications and settings

---

## 📁 Project Structure

```
interndesk/
├── src/                    # Frontend source
│   ├── app/               # React components and pages
│   ├── assets/            # Images and static files
│   └── main.jsx           # Entry point
├── server/                # Backend source
│   ├── controllers/       # API route handlers
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   ├── config/            # Database config
│   ├── interndesk.sql     # Database dump
│   └── server.js          # Express server
├── public/                # Static assets
├── DATABASE_SETUP.md      # Detailed DB setup guide
├── setup-database.bat     # Automated setup script
└── README.md             # This file
```

---

## 🛠️ Development

### Frontend Development
```bash
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

### Backend Development
```bash
cd server
npm run dev              # Start API with nodemon
npm run db:up            # Start MySQL (Docker)
npm run db:down          # Stop MySQL (Docker)
npm run db:migrate       # Run Sequelize migrations
```

---

## 🔍 API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### Internships
- GET /api/internships
- GET /api/internships/:id
- POST /api/internships
- PUT /api/internships/:id

### Applications
- GET /api/applications
- POST /api/applications/apply/:id
- GET /api/applications/company

### Admin
- GET /api/admin/stats
- GET /api/admin/jobs
- PATCH /api/admin/jobs/:id/status
- GET /api/admin/companies
- GET /api/admin/students
- GET /api/admin/notifications
- GET /api/admin/settings

Health check: GET /health

---

## 🧪 Testing

```bash
# Test database connection
curl http://localhost:5000/health

# Test admin login
# Use admin@interndesk.in from the imported database
```

---

## 🚨 Troubleshooting

### Database Connection Issues
- Verify MySQL is running: mysql -u root -p
- Check credentials in server/.env
- Ensure database interndesk exists
- Check firewall/port 3306 access

### Import Fails
```bash
# Check MySQL version
mysql --version  # Should be 8.0+

# Try with explicit database
mysql -u root -p interndesk < server/interndesk.sql
```

### Frontend Not Loading Data
- Check API is running: http://localhost:5000/health
- Verify CORS settings in server
- Check browser console for errors

---

## 📚 Additional Documentation

- [Database Setup Guide](DATABASE_SETUP.md) - Complete database documentation
- [API Documentation](server/README.md) - API endpoints and usage
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions

---

## 🔐 Security Notes

Configure a Brevo API key and verified sender before registering accounts. Verification codes are never printed to logs. Use different random values of at least 32 characters for PASSWORD_PEPPER and OTP_PEPPER. 

The frontend uses the API for authentication, profiles, internships, applications, saved listings, notifications, and employer management. The API health endpoint at /health reports whether MySQL is connected.

---

## 📄 License

This project is for educational purposes.

---

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review DATABASE_SETUP.md for database issues
3. Verify all environment variables are set
4. Check MySQL and Node.js versions

---

## ✨ Quick Commands Cheat Sheet

```bash
# Setup
setup-database.bat                    # Quick database setup
npm install && cd server && npm install  # Install all dependencies

# Development
npm run dev                          # Start frontend
cd server && npm run dev             # Start backend
curl http://localhost:5000/health    # Test API

# Database
mysql -u root -p interndesk          # Access database
mysql -u root -p interndesk < server/interndesk.sql  # Import DB
mysqldump -u root -p interndesk > backup.sql  # Backup DB

# Build
npm run build                        # Build frontend for production
```
