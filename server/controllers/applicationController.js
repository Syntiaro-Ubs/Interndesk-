import { Application, ApplicationMessage, ResumeAsset, Internship, Company, User, Notification } from '../models/index.js';
import { randomUUID } from 'crypto';
import { Op } from 'sequelize';

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

    const newApp = await Application.create({
      jobId: job.id,
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
      score: null,
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
  if (application.candidateEmail?.toLowerCase() === email) return 'student';
  const [company, recruiter] = await Promise.all([
    Company.findOne({ where: { recruiterEmail: email } }),
    User.findOne({ where: { email, role: 'company' } })
  ]);
  const companyId = company?.id || recruiter?.companyId;
  const companyName = company?.name || recruiter?.companyName;
  if ((companyId && String(application.companyId) === String(companyId)) ||
    (companyName && application.company?.toLowerCase() === companyName.toLowerCase())) return 'recruiter';
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
    const email = String(req.headers['x-user-email'] || '').toLowerCase();
    if (!await getMessageParticipant(application, email)) return res.status(403).json({ error: 'You cannot access this resume' });
    const asset = await ResumeAsset.findByPk(application.resumeKey);
    if (!asset) return res.status(404).json({ error: 'The uploaded resume file is unavailable' });
    return res.json({ fileName: asset.fileName, mimeType: asset.mimeType, dataBase64: asset.dataBase64 });
  } catch (err) {
    console.error('getApplicationResume error:', err);
    return res.status(500).json({ error: err.message || 'Could not load this resume' });
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
