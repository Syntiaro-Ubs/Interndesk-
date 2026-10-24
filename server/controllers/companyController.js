import { Op } from 'sequelize';
import { Company, Internship } from '../models/index.js';

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
