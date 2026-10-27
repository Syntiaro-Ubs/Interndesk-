import { Op, fn, col } from 'sequelize';
import { Company, Internship, Application, User } from '../models/index.js';

// ── HELPER: resolve company from request ──────────────────────
async function resolveCompany(req) {
  const userEmail = req.headers['x-user-email'];
  let comp = null;

  if (userEmail) {
    const cleanEmail = userEmail.toLowerCase().trim();
    const user = await User.findOne({ where: { email: cleanEmail } });
    if (user?.companyId) {
      comp = await Company.findByPk(user.companyId);
    }
    if (!comp) {
      comp = await Company.findOne({ where: { recruiterEmail: cleanEmail } });
    }
  }

  if (!comp && req.params?.id) {
    comp = await Company.findByPk(req.params.id);
  }

  return comp;
}

// ── GET ALL COMPANIES ─────────────────────────────────────────
export const getAllCompanies = async (req, res) => {
  try {
    const { search, industry } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { industry: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } }
      ];
    }
    if (industry && industry !== 'All') {
      where.industry = { [Op.like]: `%${industry}%` };
    }

    const companies = await Company.findAll({ where });

    // Compute live openPositionsCount per company
    const result = await Promise.all(
      companies.map(async (c) => {
        const activeJobs = await Internship.count({
          where: { companyId: c.id, status: { [Op.ne]: 'Closed' } }
        });
        return { ...c.toJSON(), openPositionsCount: activeJobs };
      })
    );

    return res.json(result);
  } catch (err) {
    console.error('getAllCompanies error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ── GET COMPANY BY ID ─────────────────────────────────────────
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    let company = null;

    if (id && !isNaN(Number(id))) {
      company = await Company.findByPk(id);
    }
    if (!company && id) {
      company = await Company.findOne({
        where: {
          [Op.or]: [
            { name: id },
            { recruiterEmail: id }
          ]
        }
      });
    }
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const internships = await Internship.findAll({ where: { companyId: company.id } });
    const openPositionsCount = internships.filter(i => i.status !== 'Closed').length;

    return res.json({
      ...company.toJSON(),
      openPositionsCount,
      internships: internships.map(i => i.toJSON())
    });
  } catch (err) {
    console.error('getCompanyById error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ── UPDATE COMPANY PROFILE ────────────────────────────────────
export const updateCompanyProfile = async (req, res) => {
  try {
    const userEmail = req.headers['x-user-email'];
    let company = null;

    if (userEmail) {
      company = await Company.findOne({ where: { recruiterEmail: userEmail.toLowerCase() } });
    }
    if (!company && req.params.id) {
      company = await Company.findByPk(req.params.id);
    }
    if (!company) {
      company = await Company.findOne();
    }
    if (!company) return res.status(404).json({ error: 'Company not found' });

    // Remove undefined/null associations-only fields before update
    const { internships, recruiters, ...updateData } = req.body;
    await company.update(updateData);

    return res.json(company.toJSON());
  } catch (err) {
    console.error('updateCompanyProfile error:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ── COMPANY ANALYTICS ─────────────────────────────────────────
// GET /api/companies/analytics  (x-user-email header required)
export const getCompanyAnalytics = async (req, res) => {
  try {
    const comp = await resolveCompany(req);
    if (!comp) return res.status(404).json({ error: 'Company not found' });

    const jobs = await Internship.findAll({
      where: {
        [Op.or]: [
          { companyId: comp.id },
          { company: comp.name }
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    const jobIds = jobs.map(j => j.id);

    // Get all applications for this company's jobs
    const applications = jobIds.length > 0
      ? await Application.findAll({ where: { jobId: { [Op.in]: jobIds } } })
      : [];

    // ── Overview stats
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === 'Active').length;
    const reviewJobs = jobs.filter(j => j.status === 'Review').length;
    const closedJobs = jobs.filter(j => j.status === 'Closed').length;
    const totalApplications = applications.length;
    const shortlisted = applications.filter(a => ['SHORTLISTED', 'Shortlisted'].includes(a.status)).length;
    const hired = applications.filter(a => ['OFFERED', 'Hired', 'Offer Received'].includes(a.status)).length;
    const interviews = applications.filter(a => ['INTERVIEW', 'Interview Scheduled'].includes(a.status)).length;
    const rejected = applications.filter(a => ['REJECTED', 'Rejected'].includes(a.status)).length;

    const conversionRate = totalApplications > 0 ? parseFloat(((hired / totalApplications) * 100).toFixed(1)) : 0;
    const shortlistRate = totalApplications > 0 ? parseFloat(((shortlisted / totalApplications) * 100).toFixed(1)) : 0;
    const avgApplicantsPerJob = totalJobs > 0 ? parseFloat((totalApplications / totalJobs).toFixed(1)) : 0;

    // ── Top performing jobs (by applicant count)
    const topJobs = jobs
      .map(j => ({
        id: j.id,
        title: j.title,
        applicants: j.applicants || 0,
        status: j.status,
        category: j.category,
        department: j.department,
        location: j.location,
        stipend: j.stipend,
        createdAt: j.createdAt
      }))
      .sort((a, b) => b.applicants - a.applicants)
      .slice(0, 5);

    // ── Application pipeline (funnel)
    const pipeline = {
      applied: totalApplications,
      review: applications.filter(a => ['Under Review', 'Review', 'IN_REVIEW'].includes(a.status)).length,
      shortlisted,
      interviewed: interviews,
      hired
    };

    // ── Applications by status distribution
    const statusDist = [
      { label: 'Applied', value: totalApplications, color: '#0a66c2' },
      { label: 'In Review', value: pipeline.review, color: '#f59e0b' },
      { label: 'Shortlisted', value: shortlisted, color: '#10b981' },
      { label: 'Interview', value: interviews, color: '#8b5cf6' },
      { label: 'Hired', value: hired, color: '#22c55e' },
      { label: 'Rejected', value: rejected, color: '#ef4444' }
    ].filter(s => s.value > 0);

    // ── Monthly applications trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);

    const monthlyApps = applications.filter(a => new Date(a.createdAt) >= sixMonthsAgo);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthMap[key] = { label: monthNames[d.getMonth()], count: 0 };
    }
    for (const app of monthlyApps) {
      const d = new Date(app.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthMap[key]) monthMap[key].count++;
    }
    const applicationTrend = Object.values(monthMap);

    // ── Department breakdown
    const deptMap = {};
    for (const job of jobs) {
      const dept = job.department || 'Other';
      if (!deptMap[dept]) deptMap[dept] = { label: dept, jobs: 0, applicants: 0 };
      deptMap[dept].jobs++;
      deptMap[dept].applicants += (job.applicants || 0);
    }
    const departmentBreakdown = Object.values(deptMap).sort((a, b) => b.applicants - a.applicants);

    // ── Recently posted jobs summary (for analytics view)
    const recentJobs = jobs.slice(0, 10).map(j => ({
      id: j.id,
      title: j.title,
      department: j.department,
      category: j.category,
      applicants: j.applicants || 0,
      status: j.status,
      deadline: j.deadline,
      createdAt: j.createdAt,
      location: j.location
    }));

    return res.json({
      company: {
        id: comp.id,
        name: comp.name,
        isVerified: comp.isVerified,
        openPositionsCount: activeJobs
      },
      stats: {
        totalJobs, activeJobs, reviewJobs, closedJobs,
        totalApplications, shortlisted, hired, interviews, rejected,
        conversionRate, shortlistRate, avgApplicantsPerJob
      },
      topJobs,
      pipeline,
      statusDist,
      applicationTrend,
      departmentBreakdown,
      recentJobs
    });
  } catch (err) {
    console.error('getCompanyAnalytics error:', err);
    return res.status(500).json({ error: err.message });
  }
};
