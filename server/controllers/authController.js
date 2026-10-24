import { Op } from 'sequelize';
import { User, Company } from '../models/index.js';
import { generateOtp, storeOtp, verifyOtp as checkOtp, sendOtpEmail, isEmailConfigured } from '../utils/emailService.js';

function getCompanyLogoColor(name = '') {
  const colors = ['#0A66C2', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6', '#14B8A6', '#F97316'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ── REGISTER ─────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const {
      email, password, role = 'student',
      firstName = '', lastName = '',
      companyName = '', companyDomain = '', designation = ''
    } = req.body;

    if (!email) return res.status(400).json({ error: 'Email is required' });
    const emailNorm = email.toLowerCase().trim();

    let companyId = null;
    let registeredCompanyName = companyName.trim();

    if (role === 'company') {
      const cleanDom = (companyDomain || emailNorm.split('@')[1] || '').toLowerCase().trim();
      registeredCompanyName = registeredCompanyName || (cleanDom ? cleanDom.split('.')[0].toUpperCase() : 'New Company');

      const [companyObj] = await Company.findOrCreate({
        where: {
          [Op.or]: [
            { name: registeredCompanyName },
            ...(cleanDom ? [{ domain: cleanDom }] : [])
          ]
        },
        defaults: {
          name: registeredCompanyName,
          domain: cleanDom,
          industry: 'Software & Technology',
          location: '',
          rating: 0,
          reviewsCount: 0,
          openPositionsCount: 0,
          description: '',
          tagline: '',
          logoColor: getCompanyLogoColor(registeredCompanyName),
          isVerified: false,
          verificationStatus: 'pending',
          website: cleanDom ? `https://${cleanDom}` : '',
          recruiterName: `${firstName} ${lastName}`.trim() || 'Hiring Lead',
          recruiterEmail: emailNorm,
          recruiterDesignation: designation || 'Talent Acquisition Partner'
        }
      });

      // Update recruiter info even if company existed
      await companyObj.update({
        recruiterName: `${firstName} ${lastName}`.trim() || companyObj.recruiterName,
        recruiterEmail: emailNorm,
        recruiterDesignation: designation || companyObj.recruiterDesignation
      });

      companyId = companyObj.id;
    }

    const [user, created] = await User.findOrCreate({
      where: { email: emailNorm },
      defaults: {
        email: emailNorm,
        password,
        name: `${firstName} ${lastName}`.trim() || emailNorm.split('@')[0],
        firstName: firstName || emailNorm.split('@')[0],
        lastName: lastName || '',
        role,
        companyId,
        companyName: registeredCompanyName,
        companyDomain,
        designation,
        profileComplete: true
      }
    });

    if (!created) {
      await user.update({
        role,
        password: password || user.password,
        name: `${firstName} ${lastName}`.trim() || user.name,
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        companyId: companyId || user.companyId,
        companyName: registeredCompanyName || user.companyName,
        companyDomain: companyDomain || user.companyDomain,
        designation: designation || user.designation,
        profileComplete: true
      });
    }

    const userData = {
      id: user.id, email: user.email, name: user.name,
      firstName: user.firstName, lastName: user.lastName, role: user.role,
      companyId: user.companyId, companyName: user.companyName,
      companyDomain: user.companyDomain, designation: user.designation,
      profileComplete: user.profileComplete
    };

    return res.status(201).json({
      user: userData,
      token: `token_${user.id}`,
      csrfToken: 'csrf_token',
      message: 'Registration successful'
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const emailNorm = email.toLowerCase().trim();

    let user = await User.findOne({ where: { email: emailNorm } });

    // --- Admin login: never auto-create, never override role ---
    if (role === 'admin') {
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. No admin account found for this email.' });
      }
      // (optional) check password if stored
    } else if (!user) {
      // Auto-create user on first login (non-admin)
      const isCompanyRole = role === 'company';
      let comp = null;
      if (isCompanyRole) {
        comp = await Company.findOne({ where: { recruiterEmail: emailNorm } });
      }

      const userName = emailNorm.split('@')[0];
      user = await User.create({
        email: emailNorm,
        password: password || '',
        name: userName,
        firstName: userName,
        lastName: isCompanyRole ? 'Recruiter' : 'Student',
        role: role || (comp ? 'company' : 'student'),
        companyId: comp ? comp.id : null,
        companyName: comp ? comp.name : '',
        profileComplete: true
      });
    } else if (role && role !== user.role && user.role !== 'admin') {
      // Only update role if user is NOT admin (protect admin accounts)
      await user.update({ role });
    }

    const userData = {
      id: user.id, email: user.email, name: user.name,
      firstName: user.firstName, lastName: user.lastName, role: user.role,
      companyId: user.companyId, companyName: user.companyName,
      companyDomain: user.companyDomain, designation: user.designation,
      profileComplete: user.profileComplete
    };

    return res.json({
      user: userData,
      token: `token_${user.id}`,
      csrfToken: 'csrf_token'
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
};

// ── ME ────────────────────────────────────────────────────────
export const me = async (req, res) => {
  try {
    const emailQuery = req.headers['x-user-email'] || req.query.email;
    if (!emailQuery) return res.status(401).json({ error: 'Not authenticated' });

    const emailNorm = emailQuery.toLowerCase().trim();
    let user = await User.findOne({ where: { email: emailNorm } });

    if (!user) {
      // Check if this email belongs to a company recruiter
      const comp = await Company.findOne({ where: { recruiterEmail: emailNorm } });
      const namePart = emailNorm.split('@')[0];
      const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

      user = await User.create({
        email: emailNorm,
        password: '',
        name: comp ? comp.recruiterName || displayName : displayName,
        firstName: comp ? (comp.recruiterName || '').split(' ')[0] || displayName : displayName,
        lastName: comp ? (comp.recruiterName || '').split(' ').slice(1).join(' ') || 'Recruiter' : 'Student',
        role: comp ? 'company' : 'student',
        companyId: comp ? comp.id : null,
        companyName: comp ? comp.name : '',
        companyDomain: comp ? comp.domain : '',
        designation: comp ? comp.recruiterDesignation || 'Hiring Manager' : '',
        profileComplete: true
      });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
        companyName: user.companyName,
        companyDomain: user.companyDomain,
        designation: user.designation,
        profileComplete: user.profileComplete
      },
      profile: {}
    });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ error: err.message });
  }
};

export const verifyEmail = register;

export const logout = (req, res) => res.json({ success: true, message: 'Logged out successfully' });

// ── SEND OTP ─────────────────────────────────────────────────
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const emailNorm = email.toLowerCase().trim();

    if (!isEmailConfigured()) {
      return res.status(503).json({
        error: 'Email service is not configured. Please add SMTP or Gmail credentials in server/.env to send verification codes.'
      });
    }

    const otp = generateOtp();
    storeOtp(emailNorm, otp);

    try {
      await sendOtpEmail(emailNorm, otp);
      console.log(`[AUTH] Verification OTP email successfully sent to: ${emailNorm}`);
      return res.json({
        success: true,
        message: `Verification code sent to ${emailNorm}. Please check your email inbox.`
      });
    } catch (mailErr) {
      console.error(`[AUTH] SMTP delivery error to ${emailNorm}:`, mailErr.message);
      return res.status(500).json({
        error: `Could not send verification email: ${mailErr.message}. Please check your email credentials in server/.env.`
      });
    }
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send verification code' });
  }
};

// ── VERIFY OTP ────────────────────────────────────────────────
export const verifyOtpCode = (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const result = checkOtp(email, otp);
    if (!result.valid) {
      return res.status(400).json({ error: result.reason });
    }
    return res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ error: err.message || 'Verification failed' });
  }
};
