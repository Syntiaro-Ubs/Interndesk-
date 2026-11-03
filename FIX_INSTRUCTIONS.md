# COMPLETE FIX FOR INTERNDESK ISSUES

## Issue 1: Notifications 500 Error

### Problem:
The Notification table doesn't have a 'category' field but the admin controller tries to query by it.

### Fix: Update server/controllers/adminController.js

Replace the \getAdminNotifications\ function (around line 334-377):

\\\javascript
// ── ADMIN NOTIFICATIONS ────────────────────────────────────────
export const getAdminNotifications = async (req, res) => {
  try {
    const { unread } = req.query;
    const adminEmail = req.adminUser.email;

    const where = { userEmail: adminEmail };
    
    // Filter by unread status only (category field doesn't exist)
    if (unread === 'true') {
      where.isRead = false;
    }

    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    const unreadCount = await Notification.count({
      where: { userEmail: adminEmail, isRead: false }
    });

    return res.json({
      notifications: notifications.map(n => n.toJSON()),
      unreadCount,
      total: notifications.length
    });
  } catch (err) {
    console.error('getAdminNotifications error:', err);
    return res.status(500).json({ error: err.message });
  }
};
\\\

## Issue 2: Internship Page Not Opening

### Root Causes:
1. selectedInternship might not be set properly
2. API call to fetch internship might be failing
3. URL routing might have issues

### Debug Steps:

1. **Check Browser Console**:
   - Press F12 and check for JavaScript errors
   - Look for failed API calls

2. **Check API Endpoint**:
   \\\ash
   # Test if API is working
   curl http://localhost:5000/api/internships
   \\\

3. **Check Network Tab**:
   - When you click on an internship, does it call /api/internships/:id?
   - What status code does it return?

4. **Add Debug Logging**:
   
   In \src/app/App.jsx\, add console.log in handleSelectInternship:
   
   \\\javascript
   const handleSelectInternship = (job) => {
     console.log('Selected internship:', job);  // ADD THIS
     setSelectedInternship(job);
     setViewRaw("details");
     syncUrl("details", portalSection, authParams, job, selectedCompany);
   };
   \\\

5. **Check if internships have proper data**:
   \\\sql
   mysql -u root -p interndesk
   SELECT id, title, company, status FROM internships;
   \\\

### Possible Solutions:

#### Solution A: Internship Status Issue
If internships are in 'Review' status, students can't see them. Update to 'Active':

\\\sql
UPDATE internships SET status = 'Active' WHERE status = 'Review';
\\\

#### Solution B: API Route Issue
Check if the internship route is properly registered in server/server.js:

\\\javascript
import internshipRoutes from './routes/internshipRoutes.js';
app.use('/api/internships', internshipRoutes);
\\\

#### Solution C: Database Connection Issue
Check if database is connected:

\\\ash
curl http://localhost:5000/health
# Should return: {"status":"ok","mysql":"connected"}
\\\

## Quick Test Commands:

\\\ash
# 1. Test database
mysql -u root -p interndesk -e "SELECT COUNT(*) as total FROM internships WHERE status='Active';"

# 2. Test API
curl http://localhost:5000/api/internships

# 3. Test specific internship
curl http://localhost:5000/api/internships/11

# 4. Check server logs
# Look at your server terminal for errors
\\\

## Expected Behavior:

1. Click on internship card in search page
2. URL changes to /internships/:id
3. DetailsPage loads with internship details
4. Shows job title, company, description, apply button

## If Still Not Working:

Please provide:
1. Browser console errors (F12 > Console)
2. Network errors (F12 > Network > Failed requests)
3. Server terminal logs
4. Screenshot of what you see

