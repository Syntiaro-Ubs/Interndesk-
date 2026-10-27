import { Op, fn, col, literal } from 'sequelize';
import { User, Company, Internship, Application, Notification } from '../models/index.js';

// ── MIDDLEWARE: verify admin ──────────────────────────────────
export const requireAdmin = async (req, res, next) => {
  const email = req.headers['x-user-email'];
  if (!email) return res.status(401).json({ error: 'Unauthorized' });
  const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Forbidden: Admin only' });
  req.adminUser = user;
  next();
};

// ── DASHBOARD STATS ───────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.count({ where: { role: 'student' } });
    const totalCompanies = await Company.count();
    const totalJobs = await Internship.count();
    const totalApplications = await Application.count();

    const pendingReview = await Internship.count({ where: { status: 'Review' } });
    const activeJobs = await Internship.count({ where: { status: 'Active' } });
    const rejectedJobs = await Internship.count({ where: { status: 'Rejected' } });
    const closedJobs = await Internship.count({ where: { status: 'Closed' } });

    // Company verification stats
    const verifiedCompanies = await Company.count({ where: { isVerified: true } });
    const unverifiedCompanies = totalCompanies - verifiedCompanies;

    // Profile completion stats
    const profilesCompleted = await User.count({ where: { role: 'student', profileComplete: true } });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newStudents = await User.count({ where: { role: 'student', createdAt: { [Op.gte]: thirtyDaysAgo } } });
    const newCompanies = await Company.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } });
    const newApplications = await Application.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } });

    // Average applications per student
    let avgApplicationsPerStudent = 0;
    if (totalStudents > 0) {
      avgApplicationsPerStudent = parseFloat((totalApplications / totalStudents).toFixed(1));
    }

    const topJobs = await Internship.findAll({
      order: [['applicants', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'company', 'applicants', 'status', 'category', 'createdAt']
    });

    const recentCompanies = await Company.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'industry', 'location', 'isVerified', 'openPositionsCount', 'createdAt']
    });

    const recentStudents = await User.findAll({
      where: { role: 'student' },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'firstName', 'lastName', 'email', 'createdAt']
    });

    const jobsPendingReview = await Internship.findAll({
      where: { status: 'Review' },
      order: [['createdAt', 'DESC']],
      limit: 10,
      attributes: ['id', 'title', 'company', 'companyId', 'category', 'department', 'stipend', 'location', 'openings', 'createdAt', 'status', 'description']
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);

    const studentTrend = await User.findAll({
      where: { role: 'student', createdAt: { [Op.gte]: sixMonthsAgo } },
      attributes: [
        [fn('YEAR', col('createdAt')), 'year'],
        [fn('MONTH', col('createdAt')), 'month'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['year', 'month'],
      order: [['year', 'ASC'], ['month', 'ASC']],
      raw: true
    });

    const companyTrend = await Company.findAll({
      where: { createdAt: { [Op.gte]: sixMonthsAgo } },
      attributes: [
        [fn('YEAR', col('createdAt')), 'year'],
        [fn('MONTH', col('createdAt')), 'month'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['year', 'month'],
      order: [['year', 'ASC'], ['month', 'ASC']],
      raw: true
    });

    return res.json({
      stats: {
        totalStudents, totalCompanies, totalJobs, totalApplications,
        pendingReview, activeJobs, rejectedJobs, closedJobs,
        newStudents, newCompanies, newApplications,
        verifiedCompanies, unverifiedCompanies,
        profilesCompleted, avgApplicationsPerStudent
      },
      topJobs: topJobs.map(j => j.toJSON()),
      recentCompanies: recentCompanies.map(c => c.toJSON()),
      recentStudents: recentStudents.map(s => s.toJSON()),
      jobsPendingReview: jobsPendingReview.map(j => j.toJSON()),
      trends: { students: studentTrend, companies: companyTrend }
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ── ALL JOB POSTS ──────────────────────────────────────────────
export const getAllJobs = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { company: { [Op.like]: `%${search}%` } }
      ];
    }
    const offset = (Number(page) - 1) * Number(limit);
    const { count, rows } = await Internship.findAndCountAll({ where, order: [['createdAt', 'DESC']], limit: Number(limit), offset });
    return res.json({ total: count, jobs: rows.map(j => j.toJSON()), page: Number(page) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── REVIEW / APPROVE / REJECT JOB ────────────────────────────
export const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const allowed = ['Active', 'Review', 'Rejected', 'Closed'];
    if (!allowed.includes(status)) return res.status(400).json({ error: `Invalid status. Allowed: ${allowed.join(', ')}` });
    const job = await Internship.findByPk(id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    await job.update({ status });
    req.app?.locals?.emit?.('job_status_changed', { jobId: job.id, title: job.title, status, reason: reason || null });
    return res.json({ success: true, job: job.toJSON(), status, reason });
  } catch (err) {
    console.error('updateJobStatus error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ── DELETE JOB (admin) ────────────────────────────────────────
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Internship.findByPk(id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const companyId = job.companyId;
    await job.destroy();

    if (companyId) {
      try {
        const comp = await Company.findByPk(companyId);
        if (comp && comp.openPositionsCount > 0) {
          await comp.decrement('openPositionsCount');
        }
      } catch {}
    }

    req.app?.locals?.emit?.('internship_deleted', { id: Number(id) });
    return res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    console.error('deleteJob error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ── ALL COMPANIES ──────────────────────────────────────────────
export const getAllCompanies = async (req, res) => {
  try {
    const { search, verified, page = 1, limit = 20 } = req.query;
    const where = {};
    if (search) where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { recruiterEmail: { [Op.like]: `%${search}%` } }];
    if (verified === 'true') where.isVerified = true;
    if (verified === 'false') where.isVerified = false;
    const offset = (Number(page) - 1) * Number(limit);
    const { count, rows } = await Company.findAndCountAll({ where, order: [['createdAt', 'DESC']], limit: Number(limit), offset });
    return res.json({ total: count, companies: rows.map(c => c.toJSON()), page: Number(page) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── ALL STUDENTS ───────────────────────────────────────────────
export const getAllStudents = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const where = { role: 'student' };
    if (search) where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }];
    const offset = (Number(page) - 1) * Number(limit);
    const { count, rows } = await User.findAndCountAll({ where, order: [['createdAt', 'DESC']], limit: Number(limit), offset, attributes: { exclude: ['password'] } });

    // Enrich each student with their application count
    const enriched = await Promise.all(rows.map(async (student) => {
      const appCount = await Application.count({ where: { candidateEmail: student.email } });
      return {
        ...student.toJSON(),
        applicationCount: appCount
      };
    }));

    return res.json({ total: count, students: enriched, page: Number(page) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── DELETE STUDENT ─────────────────────────────────────────────
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findByPk(id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (student.role === 'admin') return res.status(403).json({ error: 'Cannot delete admin accounts' });

    // Delete related applications
    await Application.destroy({ where: { candidateEmail: student.email } });
    // Delete related notifications
    await Notification.destroy({ where: { userEmail: student.email } });

    await student.destroy();
    req.app?.locals?.emit?.('student_deleted', { id: Number(id) });
    return res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    console.error('deleteStudent error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ── VERIFY COMPANY ─────────────────────────────────────────────
export const updateCompanyVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;
    const company = await Company.findByPk(id);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    await company.update({ isVerified: Boolean(isVerified), verificationStatus: isVerified ? 'verified' : 'pending' });
    return res.json({ success: true, company: company.toJSON() });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── DELETE COMPANY ─────────────────────────────────────────────
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findByPk(id);
    if (!company) return res.status(404).json({ error: 'Company not found' });

    // Delete related internships and their applications
    const internships = await Internship.findAll({ where: { companyId: id } });
    for (const job of internships) {
      await Application.destroy({ where: { jobId: job.id } });
      await job.destroy();
    }

    // Unlink company users
    await User.update({ companyId: null, companyName: '' }, { where: { companyId: id } });

    await company.destroy();
    req.app?.locals?.emit?.('company_deleted', { id: Number(id) });
    return res.json({ success: true, message: 'Company and related data deleted successfully' });
  } catch (err) {
    console.error('deleteCompany error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ── SEED ADMIN (one-time setup) ────────────────────────────────
// POST /api/admin/seed  { email, name, secretKey }
// secretKey must match process.env.ADMIN_SEED_KEY (default: 'interndesk-admin-2024')
export const seedAdmin = async (req, res) => {
  try {
    const { email, name, secretKey } = req.body;
    const SEED_KEY = process.env.ADMIN_SEED_KEY || 'interndesk-admin-2024';

    if (!secretKey || secretKey !== SEED_KEY) {
      return res.status(403).json({ error: 'Invalid seed key.' });
    }
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const emailNorm = email.toLowerCase().trim();
    const adminName = name?.trim() || emailNorm.split('@')[0];

    const [user, created] = await User.findOrCreate({
      where: { email: emailNorm },
      defaults: {
        email: emailNorm,
        password: '',
        name: adminName,
        firstName: adminName.split(' ')[0] || adminName,
        lastName: adminName.split(' ').slice(1).join(' ') || '',
        role: 'admin',
        profileComplete: true
      }
    });

    // Always force role to admin
    if (!created) {
      await user.update({ role: 'admin', name: adminName });
    }

    return res.json({
      success: true,
      message: created ? 'Admin account created.' : 'Existing account updated to admin.',
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (err) {
    console.error('seedAdmin error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ── ADMIN NOTIFICATIONS ────────────────────────────────────────
export const getAdminNotifications = async (req, res) => {
  try {
    const { category, unread } = req.query;
    const adminEmail = req.adminUser.email;

    const where = { userEmail: adminEmail };
    if (category && category !== 'all') {
      where.category = category;
    }
    if (unread === 'true') {
      where.isRead = false;
    }

    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    const categoryCounts = await Notification.findAll({
      attributes: [
        'category',
        [fn('COUNT', col('id')), 'count']
      ],
      where: { userEmail: adminEmail },
      group: ['category'],
      raw: true
    });

    const unreadCount = await Notification.count({
      where: { userEmail: adminEmail, isRead: false }
    });

    return res.json({
      notifications: notifications.map(n => n.toJSON()),
      categoryCounts,
      unreadCount,
      total: notifications.length
    });
  } catch (err) {
    console.error('getAdminNotifications error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ── ADMIN MARK ALL NOTIFICATIONS READ ──────────────────────────
export const markAllAdminNotificationsRead = async (req, res) => {
  try {
    const adminEmail = req.adminUser.email;
    await Notification.update(
      { isRead: true },
      { where: { userEmail: adminEmail, isRead: false } }
    );
    return res.json({ success: true, message: 'All admin notifications marked as read' });
  } catch (err) {
    console.error('markAllAdminNotificationsRead error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ── ADMIN SETTINGS ─────────────────────────────────────────────
export const getAdminSettings = async (req, res) => {
  try {
    const admin = req.adminUser;
    
    // Get settings from User model or create defaults
    const settings = {
      profile: {
        name: admin.name || 'InternDesk Admin',
        email: admin.email,
        role: 'Super admin',
        firstName: admin.firstName || 'Admin',
        lastName: admin.lastName || ''
      },
      reviewRules: {
        requireApproval: true,
        autoVerifyKnown: false,
        requireRejectionReason: true
      },
      emailAlerts: {
        newJobSubmitted: true,
        newCompanySignup: true,
        weeklySummary: false
      }
    };

    return res.json(settings);
  } catch (err) {
    console.error('getAdminSettings error:', err);
    return res.status(500).json({ error: err.message });
  }
};

export const updateAdminSettings = async (req, res) => {
  try {
    const admin = req.adminUser;
    const { profile, reviewRules, emailAlerts } = req.body;

    // Update admin profile if provided
    if (profile) {
      await admin.update({
        name: profile.name || admin.name,
        firstName: profile.firstName || admin.firstName,
        lastName: profile.lastName || admin.lastName
      });
    }

    // In a real app, store reviewRules and emailAlerts in a settings table
    // For now, just return success
    const updatedSettings = {
      profile: {
        name: admin.name,
        email: admin.email,
        role: 'Super admin',
        firstName: admin.firstName,
        lastName: admin.lastName
      },
      reviewRules: reviewRules || { requireApproval: true, autoVerifyKnown: false, requireRejectionReason: true },
      emailAlerts: emailAlerts || { newJobSubmitted: true, newCompanySignup: true, weeklySummary: false }
    };

    return res.json({ success: true, settings: updatedSettings });
  } catch (err) {
    console.error('updateAdminSettings error:', err);
    return res.status(500).json({ error: err.message });
  }
};
