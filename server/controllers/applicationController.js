import zlib from 'zlib';
import { Application, ApplicationMessage, ResumeAsset, Internship, Company, User, Notification } from '../models/index.js';
import { randomUUID } from 'crypto';
import { Op } from 'sequelize';


export function calculateApplicationScore({ job, resumeAsset, candidateSkills = [], course = '', college = '', candidateName = '', candidateEmail = '' }) {
  let requiredSkills = [];
  try {
    if (Array.isArray(job?.skills)) requiredSkills = job.skills;
    else if (typeof job?.skills === 'string') requiredSkills = JSON.parse(job.skills);
  } catch {
    requiredSkills = (job?.skills || '').split(',').map((s) => s.trim()).filter(Boolean);
  }
  const reqSkillsNorm = requiredSkills.map((s) => String(s).toLowerCase().trim()).filter(Boolean);

  let resumeTokens = '';
  if (resumeAsset?.dataBase64) {
    try {
      const buf = Buffer.from(resumeAsset.dataBase64, 'base64');
      const ascii = buf.toString('latin1');
      let uncompressedText = '';
      let streamStart = 0;
      while ((streamStart = ascii.indexOf('stream', streamStart)) !== -1) {
        streamStart += 6;
        if (ascii[streamStart] === '\r') streamStart++;
        if (ascii[streamStart] === '\n') streamStart++;
        const streamEnd = ascii.indexOf('endstream', streamStart);
        if (streamEnd === -1) break;
        try {
          const slice = buf.subarray(streamStart, streamEnd);
          const decompressed = zlib.inflateSync(slice).toString('utf-8');
          uncompressedText += ' ' + decompressed;
        } catch {
          // not raw deflate stream, ignore
        }
        streamStart = streamEnd + 9;
      }
      resumeTokens = (ascii + ' ' + uncompressedText).toLowerCase();
    } catch {
      resumeTokens = '';
    }
  }

  const allCandidateText = [
    resumeTokens,
    resumeAsset?.fileName || '',
    candidateName,
    course,
    college,
    ...(Array.isArray(candidateSkills) ? candidateSkills : String(candidateSkills || '').split(','))
  ].join(' ').toLowerCase();

  let baseScore = 65;

  // A. Skill Matching (up to +18 points)
  let matchedSkillsCount = 0;
  if (reqSkillsNorm.length > 0) {
    for (const skill of reqSkillsNorm) {
      if (allCandidateText.includes(skill)) {
        matchedSkillsCount++;
      }
    }
    const skillRatio = matchedSkillsCount / reqSkillsNorm.length;
    baseScore += Math.round(skillRatio * 18);
  } else {
    baseScore += 10;
  }

  // B. Job Title / Role Relevance (up to +6 points)
  const jobTitleWords = (job?.title || 'developer').toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  let titleMatches = 0;
  for (const word of jobTitleWords) {
    if (allCandidateText.includes(word)) titleMatches++;
  }
  baseScore += Math.min(6, titleMatches * 2);

  // C. Education Relevance (up to +6 points)
  const courseLower = (course || '').toLowerCase();
  const techDegrees = ['computer', 'b.tech', 'btech', 'mca', 'bca', 'information technology', 'software', 'data', 'it', 'cs', 'ai'];
  if (techDegrees.some((td) => courseLower.includes(td))) {
    baseScore += 6;
  } else if (courseLower.includes('b.') || courseLower.includes('degree')) {
    baseScore += 3;
  }

  // D. Document Completeness (up to +4 points based on file size/presence)
  if (resumeAsset?.dataBase64 && resumeAsset.dataBase64.length > 10000) {
    baseScore += 4;
  } else if (resumeAsset?.fileName) {
    baseScore += 2;
  }

  // E. Unique Deterministic Variance based on actual file bytes and applicant (0 to +7 points)
  const uniquePayload = (candidateName || '') + (candidateEmail || '') + (resumeAsset?.fileName || '') + (resumeAsset?.dataBase64 ? resumeAsset.dataBase64.slice(0, 500) : '');
  let hashNum = 0;
  for (let i = 0; i < uniquePayload.length; i++) {
    hashNum = (hashNum * 33 + uniquePayload.charCodeAt(i)) >>> 0;
  }
  const variance = (hashNum % 8);
  baseScore += variance;

  return Math.max(62, Math.min(96, baseScore));
}

export const applyForInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      candidateName,
      candidateEmail,
      candidatePhone,
      phone,
      resumeKey,
      coverNote = '',
      college = 'State Technical University',
      course = 'B.Tech Computer Science'
    } = req.body;

    const phoneNumber = String(phone || candidatePhone || '').replace(/[\s()-]/g, '');
    if (!/^(?:\+91)?[6-9]\d{9}$/.test(phoneNumber)) {
      return res.status(400).json({ error: 'Enter a valid 10-digit Indian mobile number, optionally with +91.' });
    }
    const authenticatedEmail = String(req.headers['x-user-email'] || '').toLowerCase().trim();
    if (!authenticatedEmail) return res.status(401).json({ error: 'Sign in with a student account before applying.' });
    const student = await User.findOne({ where: { email: authenticatedEmail, role: 'student' } });
    if (!student) return res.status(401).json({ error: 'Sign in with a student account before applying.' });

    const job = await Internship.findByPk(id);
    if (!job) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    const email = authenticatedEmail;

    // Check if already applied
    const existingApp = await Application.findOne({
      where: {
        jobId: id,
        candidateEmail: email
      }
    });

    if (existingApp) {
      return res.status(400).json({ error: 'You have already applied for this internship.' });
    }

    const resumeAsset = resumeKey ? await ResumeAsset.findByPk(resumeKey) : null;
    const dynamicScore = calculateApplicationScore({
      job,
      resumeAsset,
      candidateSkills: req.body.skills,
      course,
      college,
      candidateName,
      candidateEmail: email
    });

    const newApp = await Application.create({
      jobId: job.id,
      studentId: student.id,
      jobTitle: job.title || 'Internship',
      title: job.title || 'Internship',
      company: job.company || 'Company',
      companyId: job.companyId || null,
      logoColor: job.logoColor || '#0a66c2',
      category: job.category || 'IT',
      status: 'Under Review',
      nextStep: 'Application submitted. The hiring team will review your profile shortly.',
      appliedAt: new Date(),
      studentName: candidateName || 'Student Applicant',
      name: candidateName || 'Student Applicant',
      candidateEmail: email,
      candidatePhone: phoneNumber,
      phone: phoneNumber,
      college,
      course,
      score: dynamicScore,
      resumeKey: resumeKey || 'resume.pdf',
      coverNote
    });

    // Increment applicant count on job
    job.applicants = (job.applicants || 0) + 1;
    await job.save();

    // Send confirmation notification to student
    const confirmationNotif = await Notification.create({
      userEmail: email,
      title: `Application Sent: ${newApp.jobTitle}`,
      message: `Your application for "${newApp.jobTitle}" at ${newApp.company} has been received.`,
      status: 'Under Review',
      jobId: job.id,
      company: newApp.company,
      isRead: false
    });

    // Real-Time SSE emission
    req.app?.locals?.emit?.('application_created', newApp.toJSON());
    req.app?.locals?.emit?.('notification_created', confirmationNotif.toJSON());

    return res.status(201).json(newApp);
  } catch (err) {
    console.error('applyForInternship error:', err);
    return res.status(500).json({ error: err.message || 'Failed to submit application' });
  }
};

export const getStudentApplications = async (req, res) => {
  try {
    const userEmail = req.headers['x-user-email'];
    const where = {};

    if (userEmail) {
      where.candidateEmail = userEmail.toLowerCase();
    }

    const list = await Application.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    return res.json(list);
  } catch (err) {
    console.error('getStudentApplications error:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch student applications' });
  }
};

export const getCompanyApplications = async (req, res) => {
  try {
    const userEmail = req.headers['x-user-email'];
    const { jobId } = req.query;

    let where = {};

    if (jobId) {
      where.jobId = jobId;
    } else if (userEmail) {
      const currentComp = await Company.findOne({
        where: { recruiterEmail: userEmail.toLowerCase() }
      });

      if (currentComp) {
        where = {
          [Op.or]: [
            { companyId: currentComp.id },
            { company: currentComp.name }
          ]
        };
      }
    }

    const applications = await Application.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    // Automatically recalculate dynamic scores for existing/legacy applications
    for (const app of applications) {
      if (app.score === 55 || app.score === 88 || app.score == null) {
        try {
          const job = await Internship.findByPk(app.jobId);
          const resumeAsset = app.resumeKey ? await ResumeAsset.findByPk(app.resumeKey) : null;
          const dynamicScore = calculateApplicationScore({
            job,
            resumeAsset,
            course: app.course,
            college: app.college,
            candidateName: app.name,
            candidateEmail: app.candidateEmail
          });
          await app.update({ score: dynamicScore });
          app.score = dynamicScore;
        } catch (err) {
          console.warn('Could not recalculate score for application', app.id, err.message);
        }
      }
    }

    const result = applications.map((app) => ({
      id: app.id,
      name: app.name || app.studentName || 'Student Applicant',
      email: app.candidateEmail || 'student@example.com',
      phone: app.phone || app.candidatePhone || '+91 98765 43210',
      college: app.college || 'State Technical University',
      course: app.course || 'B.Tech Computer Science',
      internship: app.jobTitle || app.title || 'Internship',
      internshipId: app.jobId,
      status: app.status === 'Applied' ? 'Review' : app.status,
      applied: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Today',
      appliedAt: app.appliedAt,
      resumeKey: app.resumeKey || 'resume.pdf',
      score: app.score == null ? null : Number(app.score)
    }));

    return res.json(result);
  } catch (err) {
    console.error('getCompanyApplications error:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch company applications' });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, statusLabel } = req.body;

    const app = await Application.findByPk(id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const statusMap = {
      IN_REVIEW: 'Under Review',
      Review: 'Under Review',
      INTERVIEW: 'Interview Scheduled',
      'Interview Scheduled': 'Interview Scheduled',
      SHORTLISTED: 'Shortlisted',
      Shortlisted: 'Shortlisted',
      OFFERED: 'Offer Received',
      Hired: 'Offer Received',
      REJECTED: 'Rejected',
      Rejected: 'Rejected'
    };
    const cleanStatus = statusMap[status] || statusLabel || status;

    const nextStepsMap = {
      'Under Review': 'The hiring team is currently reviewing your application portfolio.',
      'Interview Scheduled': 'Congratulations! You have an upcoming interview. Check your email for call links.',
      Shortlisted: 'You have been shortlisted for final evaluation by the hiring committee.',
      'Offer Received': 'Congratulations! You have received an internship offer letter.',
      Rejected: 'Thank you for your interest. The company has decided to proceed with other candidates.'
    };

    app.status = cleanStatus;
    app.nextStep = nextStepsMap[cleanStatus] || `Application status updated to ${cleanStatus}.`;
    await app.save();

    // Real-Time Notification for the student
    const newNotif = await Notification.create({
      userEmail: app.candidateEmail,
      title: `Application Status: ${app.jobTitle || app.title}`,
      message: `${app.company} updated your application status to "${cleanStatus}". ${nextStepsMap[cleanStatus] || ''}`,
      status: cleanStatus,
      jobId: app.jobId,
      company: app.company,
      isRead: false
    });

    req.app?.locals?.emit?.('application_status_updated', {
      application: app.toJSON(),
      notification: newNotif.toJSON()
    });

    return res.json({
      success: true,
      message: 'Application status updated and student notified',
      application: app,
      notification: newNotif
    });
  } catch (err) {
    console.error('updateApplicationStatus error:', err);
    return res.status(500).json({ error: err.message || 'Failed to update application status' });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await Application.findByPk(id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    await app.destroy();
    req.app?.locals?.emit?.('application_deleted', { id });
    return res.json({ success: true, message: 'Application deleted successfully' });
  } catch (err) {
    console.error('deleteApplication error:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete application' });
  }
};

const getMessageParticipant = async (application, email) => {
  if (!email) return null;
  const cleanEmail = String(email).trim().toLowerCase();
  if (application.candidateEmail?.toLowerCase() === cleanEmail) return 'student';
  const [company, recruiter, user] = await Promise.all([
    Company.findOne({ where: { recruiterEmail: cleanEmail } }),
    User.findOne({ where: { email: cleanEmail, role: 'company' } }),
    User.findOne({ where: { email: cleanEmail } })
  ]);
  if (user?.role === 'admin') return 'recruiter';
  const companyId = company?.id || recruiter?.companyId;
  const companyName = (company?.name || recruiter?.companyName || '').trim().toLowerCase();
  const appCompany = (application.company || '').trim().toLowerCase();
  if (companyId && application.companyId && String(application.companyId) === String(companyId)) return 'recruiter';
  if (companyName && appCompany && (companyName === appCompany || appCompany.includes(companyName) || companyName.includes(appCompany))) return 'recruiter';
  if (company && !application.companyId && companyName === appCompany) return 'recruiter';
  if (recruiter) return 'recruiter';
  return null;
};

export const uploadResume = async (req, res) => {
  try {
    const ownerEmail = String(req.headers['x-user-email'] || '').trim().toLowerCase();
    const { fileName, mimeType, dataBase64 } = req.body || {};
    if (!ownerEmail) return res.status(401).json({ error: 'Sign in before uploading a resume' });
    if (!fileName || !dataBase64) return res.status(400).json({ error: 'Resume file is required' });
    if (String(dataBase64).length > 7_000_000) return res.status(413).json({ error: 'Resume must be 5 MB or smaller' });
    const resumeKey = `resume_${randomUUID()}`;
    const asset = await ResumeAsset.create({
      resumeKey,
      ownerEmail,
      fileName: String(fileName).slice(0, 255),
      mimeType: String(mimeType || 'application/octet-stream').slice(0, 120),
      dataBase64: String(dataBase64).replace(/^data:[^,]+,/, '')
    });
    return res.status(201).json({ resumeKey: asset.resumeKey, fileName: asset.fileName, uploadedAt: asset.createdAt });
  } catch (err) {
    console.error('uploadResume error:', err);
    return res.status(500).json({ error: err.message || 'Could not store this resume' });
  }
};

export const getApplicationResume = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    const email = String(req.query.email || req.headers['x-user-email'] || '').toLowerCase();
    if (email && !await getMessageParticipant(application, email)) {
      return res.status(403).json({ error: 'You cannot access this resume' });
    }
    const asset = await ResumeAsset.findByPk(application.resumeKey);
    if (!asset || !asset.dataBase64) {
      return res.status(404).json({
        error: 'The uploaded resume file is unavailable in storage.',
        notFound: true,
        candidateName: application.name || application.studentName,
        course: application.course,
        college: application.college
      });
    }
    return res.json({ fileName: asset.fileName, mimeType: asset.mimeType, dataBase64: asset.dataBase64 });
  } catch (err) {
    console.error('getApplicationResume error:', err);
    return res.status(500).json({ error: err.message || 'Could not load this resume' });
  }
};

export const streamApplicationResume = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) return res.status(404).send('Application not found');
    const email = String(req.query.email || req.headers['x-user-email'] || '').toLowerCase();
    if (email && !await getMessageParticipant(application, email)) {
      return res.status(403).send('You cannot access this resume');
    }
    const asset = await ResumeAsset.findByPk(application.resumeKey);
    if (!asset || !asset.dataBase64) {
      return res.status(404).send('Resume file is not available in storage');
    }
    const buffer = Buffer.from(asset.dataBase64, 'base64');
    const safeName = (asset.fileName || (application.name || 'Candidate') + '_Resume.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
    res.setHeader('Content-Type', asset.mimeType || 'application/pdf');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', 'inline; filename="' + safeName + '"');
    return res.end(buffer);
  } catch (err) {
    console.error('streamApplicationResume error:', err);
    return res.status(500).send('Could not load this resume');
  }
};

export const downloadOwnedResume = async (req, res) => {
  try {
    const email = String(req.headers['x-user-email'] || '').toLowerCase();
    const asset = await ResumeAsset.findByPk(req.params.key);
    if (!asset) return res.status(404).json({ error: 'The uploaded resume file is unavailable' });
    if (!email || asset.ownerEmail !== email) return res.status(403).json({ error: 'You cannot access this resume' });
    res.setHeader('Content-Type', asset.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${asset.fileName.replace(/["\\\r\n]/g, '_')}"`);
    return res.send(Buffer.from(asset.dataBase64, 'base64'));
  } catch (err) {
    console.error('downloadOwnedResume error:', err);
    return res.status(500).json({ error: err.message || 'Could not load this resume' });
  }
};

export const getApplicationMessages = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    const email = String(req.headers['x-user-email'] || '').toLowerCase();
    if (!await getMessageParticipant(application, email)) return res.status(403).json({ error: 'You cannot access this conversation' });
    const messages = await ApplicationMessage.findAll({ where: { applicationId: application.id }, order: [['createdAt', 'ASC'], ['id', 'ASC']] });
    return res.json(messages.map((message) => ({ ...message.toJSON(), from: message.senderRole === 'recruiter' ? 'recruiter' : 'student' })));
  } catch (err) {
    console.error('getApplicationMessages error:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch messages' });
  }
};

export const sendApplicationMessage = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    const email = String(req.headers['x-user-email'] || '').toLowerCase();
    const senderRole = await getMessageParticipant(application, email);
    if (!senderRole) return res.status(403).json({ error: 'You cannot send messages in this conversation' });
    const text = String(req.body?.message || '').trim();
    if (!text) return res.status(400).json({ error: 'Message cannot be empty' });
    const message = await ApplicationMessage.create({
      applicationId: application.id,
      senderEmail: email,
      senderName: req.body?.senderName || email,
      senderRole,
      message: text
    });
    const payload = { ...message.toJSON(), from: senderRole === 'recruiter' ? 'recruiter' : 'student' };
    req.app?.locals?.emit?.('application_message_created', payload);
    return res.status(201).json(payload);
  } catch (err) {
    console.error('sendApplicationMessage error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send message' });
  }
};
