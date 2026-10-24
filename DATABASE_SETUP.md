# Database Setup Guide - InternDesk

## 📊 Database Overview

The `interndesk.sql` file contains a complete MySQL database dump with:
- **7 Tables**: Users, Companies, Internships, Applications, Notifications, Messages, Resume Assets
- **Sample Data**: Pre-populated with test users, companies, and internships
- **Admin Account**: `admin@interndesk.in` with admin role

---

## 🗃️ Database Schema

### Tables Structure:

1. **users** - User accounts (students, companies, admins)
2. **companies** - Company profiles and information
3. **internships** - Job/internship postings
4. **applications** - Student applications to internships
5. **application_messages** - Chat messages between students and recruiters
6. **notifications** - System notifications for users
7. **resume_assets** - Uploaded resume files (base64 encoded)

---

## 🚀 Quick Start

### Option 1: Import SQL File Directly (Recommended)

```bash
# Navigate to server directory
cd server

# Import the SQL dump
mysql -u root -p < interndesk.sql

# Or specify database name
mysql -u root -p interndesk < interndesk.sql
```

### Option 2: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Go to **Server > Data Import**
4. Select **Import from Self-Contained File**
5. Browse to `server/interndesk.sql`
6. Select **Default Target Schema**: interndesk
7. Click **Start Import**

### Option 3: Using phpMyAdmin

1. Open phpMyAdmin
2. Create database `interndesk` if not exists
3. Select the database
4. Go to **Import** tab
5. Choose file: `server/interndesk.sql`
6. Click **Go**

---

## 🔧 Setup Steps

### 1. Create Database (if needed)

```sql
CREATE DATABASE IF NOT EXISTS interndesk CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE interndesk;
```

### 2. Import the SQL File

```bash
# From server directory
mysql -u root -p interndesk < interndesk.sql
```

### 3. Verify Import

```sql
USE interndesk;
SHOW TABLES;
SELECT * FROM users;
```

You should see 7 tables and existing data.

### 4. Configure Environment

Update your `server/.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=interndesk
```

---

## 👥 Pre-populated Data

### Admin Account
- **Email**: admin@interndesk.in
- **Role**: admin
- **Name**: Site Admin

### Sample Companies
- **Acme Technologies** (alice@acme.com)
- **KHUSHISAGALE** (khushisagale@gmail.com)

### Sample Users
- **Students**: Multiple test student accounts
- **Recruiters**: Company recruiters with access

### Sample Internships
- Full Stack Developer Intern at Acme Technologies
- Full Stack Java Developer at KHUSHISAGALE

---

## 🔄 Database Management Scripts

Create these helper scripts in `server/` directory:

### `db-reset.sh` (Linux/Mac)
```bash
#!/bin/bash
echo "Resetting database..."
mysql -u root -p interndesk < interndesk.sql
echo "Database reset complete!"
```

### `db-reset.bat` (Windows)
```batch
@echo off
echo Resetting database...
mysql -u root -p interndesk < interndesk.sql
echo Database reset complete!
pause
```

### `db-backup.sh` (Backup Script)
```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p interndesk > "backups/interndesk_backup_$TIMESTAMP.sql"
echo "Backup created: interndesk_backup_$TIMESTAMP.sql"
```

---

## 📋 Table Details

### users
- Stores all user accounts (students, companies, admins)
- Links to companies via `companyId`
- Role-based access: 'student', 'company', 'admin'

### companies
- Company profiles with verification status
- Linked to recruiters via users table
- Tracks open positions and ratings

### internships
- Job postings with full details
- Status: Active, Review, Rejected, Closed
- Tracks applicant count

### applications
- Student applications to jobs
- Status tracking and resume storage
- Links to internships and students

### notifications
- User notifications for applications, updates
- Read/unread status
- Category-based filtering

---

## 🔍 Useful Queries

### Check Admin Users
```sql
SELECT * FROM users WHERE role = 'admin';
```

### Count Active Internships
```sql
SELECT COUNT(*) FROM internships WHERE status = 'Active';
```

### Recent Applications
```sql
SELECT a.*, i.title, c.name as company_name 
FROM applications a
JOIN internships i ON a.jobId = i.id
JOIN companies c ON i.companyId = c.id
ORDER BY a.createdAt DESC
LIMIT 10;
```

### Unread Notifications
```sql
SELECT * FROM notifications WHERE isRead = 0 ORDER BY createdAt DESC;
```

---

## 🛠️ Troubleshooting

### Error: Access Denied
```bash
# Grant permissions
mysql -u root -p
GRANT ALL PRIVILEGES ON interndesk.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### Error: Database Already Exists
```bash
# Drop and recreate
mysql -u root -p
DROP DATABASE IF EXISTS interndesk;
CREATE DATABASE interndesk;
exit;
mysql -u root -p interndesk < interndesk.sql
```

### Error: Foreign Key Constraints
```sql
-- Disable checks during import
SET FOREIGN_KEY_CHECKS = 0;
SOURCE interndesk.sql;
SET FOREIGN_KEY_CHECKS = 1;
```

---

## 🔄 Update SQL Dump

When you need to update the SQL file with current data:

```bash
# Export current database
mysqldump -u root -p interndesk > server/interndesk.sql

# With compression
mysqldump -u root -p interndesk | gzip > server/interndesk.sql.gz
```

---

## 🔐 Security Notes

1. **Never commit `.env` files** with real credentials
2. **Change default passwords** in production
3. **Use strong passwords** for database users
4. **Enable SSL** for MySQL connections in production
5. **Backup regularly** before making schema changes

---

## 📦 Migration Strategy

If you prefer Sequelize migrations over SQL dumps:

```bash
# Generate migration from existing database
npx sequelize-auto -h localhost -d interndesk -u root -x password -e mysql

# Run migrations
cd server
npm run db:migrate
```

---

## ✅ Verification Checklist

After importing the SQL file:

- [ ] Database `interndesk` exists
- [ ] All 7 tables created
- [ ] Admin user exists (admin@interndesk.in)
- [ ] Sample data loaded
- [ ] Foreign keys working
- [ ] Server can connect (check `/health` endpoint)
- [ ] Login with admin account works
- [ ] Frontend loads data correctly

---

## 🆘 Support

If you encounter issues:
1. Check MySQL error logs
2. Verify database credentials in `.env`
3. Ensure MySQL service is running
4. Test connection: `mysql -u root -p interndesk`
5. Check Sequelize models match schema

---

## 📚 Related Files

- `server/.env` - Database credentials
- `server/config/database.js` - Sequelize configuration
- `server/models/` - Database models (Sequelize)
- `server/server.js` - Database connection initialization
