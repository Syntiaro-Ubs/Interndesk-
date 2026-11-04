import { Op } from 'sequelize';
import { User, Company } from '../models/index.js';
import { generateOtp, storeOtp, verifyOtp as checkOtp, consumeOtp, sendOtpEmail, isEmailConfigured } from '../utils/emailService.js';

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
      companyName = '', companyDomain = '', designation = '',
      otp
    } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    if (!password || password.trim().length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const emailNorm = email.toLowerCase().trim();

    // Check if account already exists
    const existing = await User.findOne({ where: { email: emailNorm } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
    }

    // Verify OTP if provided (without consuming yet)
    if (otp) {
      const otpCheck = await checkOtp(emailNorm, otp, false);
      if (!otpCheck.valid) {
        return res.status(400).json({ error: otpCheck.reason });
      }
    }

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

      // Update recruiter info on company
      await companyObj.update({
        recruiterName: `${firstName} ${lastName}`.trim() || companyObj.recruiterName,
        recruiterEmail: emailNorm,
        recruiterDesignation: designation || companyObj.recruiterDesignation
      });

      companyId = companyObj.id;
    }

    // Create verified user record
    const user = await User.create({
      email: emailNorm,
      password: password.trim(),
      name: `${firstName} ${lastName}`.trim() || emailNorm.split('@')[0],
      firstName: firstName || emailNorm.split('@')[0],
      lastName: lastName || '',
      role,
      companyId,
      companyName: registeredCompanyName,
      companyDomain,
      designation,
      profileComplete: true
    });

    // Registration succeeded! Consume the OTP now
    if (otp) {
      await consumeOtp(emailNorm);
    }

    const userData = {
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
    };

    return res.status(201).json({
      user: userData,
      token: `token_${user.id}`,
      csrfToken: 'csrf_token',
      message: 'Account registered successfully.'
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: err.message || 'Registration failed.' });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    if (!password || !password.trim()) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    const emailNorm = email.toLowerCase().trim();

    // 1. Strict user lookup: NEVER auto-create users on login
    const user = await User.findOne({ where: { email: emailNorm } });
    if (!user) {
      return res.status(404).json({
        error: 'No account found with this email. Please check your email or sign up first.'
      });
    }

    // 2. Strict Role Partitioning:
    // If account is Super Admin:
    if (user.role === 'admin' && role !== 'admin') {
      return res.status(403).json({
        error: 'Super Admin credentials can only be used on the dedicated Super Admin login page (/admin/login).'
      });
    }

    // If trying to access Super Admin without an admin account:
    if (role === 'admin' && user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. This account does not have Super Admin privileges.'
      });
    }

    // If student tries to log in under employer tab:
    if (role === 'company' && user.role !== 'company') {
      return res.status(403).json({
        error: 'This email is registered as a Student account. Please switch to the Student login tab.'
      });
    }

    // If employer tries to log in under student tab:
    if (role === 'student' && user.role !== 'student') {
      return res.status(403).json({
        error: 'This email is registered as an Employer account. Please switch to the Employer login tab.'
      });
    }

    // 3. Strict Password Verification:
    // Fallback password for seeded admin if empty: 'interdesk@26'
    const expectedPassword = (user.role === 'admin' && (!user.password || !user.password.trim()))
      ? 'interdesk@26'
      : (user.password || '').trim();

    if (!expectedPassword || expectedPassword !== password.trim()) {
      return res.status(401).json({
        error: 'Incorrect password. Please verify your credentials and try again.'
      });
    }

    const userData = {
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
      profileComplete: Boolean(user.profileComplete)
    };

    return res.json({
      user: userData,
      token: `token_${user.id}`,
      csrfToken: 'csrf_token',
      message: 'Logged in successfully.'
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message || 'Login failed.' });
  }
};

// ── ME ────────────────────────────────────────────────────────
export const me = async (req, res) => {
  try {
    const emailQuery = req.headers['x-user-email'] || req.query.email;
    if (!emailQuery) return res.status(401).json({ error: 'Not authenticated.' });

    const emailNorm = emailQuery.toLowerCase().trim();
    const user = await User.findOne({ where: { email: emailNorm } });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
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

export const logout = (req, res) => res.json({ success: true, message: 'Logged out successfully.' });

// ── SEND OTP ─────────────────────────────────────────────────
export const sendOtp = async (req, res) => {
  try {
    const { email, mode } = req.body;
    if (!email || !email.trim()) return res.status(400).json({ error: 'Email is required.' });
    const emailNorm = email.toLowerCase().trim();

    // If registering, check if account already exists
    if (mode === 'register') {
      const existing = await User.findOne({ where: { email: emailNorm } });
      if (existing) {
        return res.status(409).json({
          error: 'An account with this email already exists. Please log in instead.'
        });
      }
    }

    if (!isEmailConfigured()) {
      return res.status(503).json({
        error: 'Email service is not configured. Please add SMTP or Gmail credentials in server/.env to send verification codes.'
      });
    }

    const otp = generateOtp();
    await storeOtp(emailNorm, otp);

    try {
      await sendOtpEmail(emailNorm, otp);
      console.log(`[AUTH] Verification OTP email successfully sent to: ${emailNorm} (OTP Code: ${otp})`);
      return res.json({
        success: true,
        message: `Verification code sent to ${emailNorm}. Please check your email inbox.`
      });
    } catch (mailErr) {
      console.error(`[AUTH] SMTP delivery error to ${emailNorm}:`, mailErr.message);
      return res.status(500).json({
        error: `Could not send verification email: ${mailErr.message}. Please check your email credentials.`
      });
    }
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send verification code.' });
  }
};

// ── VERIFY OTP ────────────────────────────────────────────────
export const verifyOtpCode = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required.' });

    // Validate without destroying OTP so subsequent /register can consume it
    const result = await checkOtp(email, otp, false);
    if (!result.valid) {
      return res.status(400).json({ error: result.reason });
    }
    return res.json({ success: true, message: 'Email verified successfully.' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ error: err.message || 'Verification failed.' });
  }
};
