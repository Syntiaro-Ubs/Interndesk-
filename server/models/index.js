/**
 * models/index.js
 * Central export for all Sequelize models + associations
 */
import sequelize from '../config/database.js';
import User from './User.js';
import Company from './Company.js';
import Internship from './Internship.js';
import Application from './Application.js';
import Notification from './Notification.js';
import ApplicationMessage from './ApplicationMessage.js';
import ResumeAsset from './ResumeAsset.js';
import EmailOtp from './EmailOtp.js';
import Payment from './Payment.js';
import SystemSetting from './SystemSetting.js';

// ── Associations ─────────────────────────────────────────────
// User has many Payments
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Company has many Users (recruiters)
Company.hasMany(User, { foreignKey: 'companyId', as: 'recruiters' });
User.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// Company has many Internships
Company.hasMany(Internship, { foreignKey: 'companyId', as: 'internships' });
Internship.belongsTo(Company, { foreignKey: 'companyId', as: 'companyInfo' });

// Internship has many Applications
Internship.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });
Application.belongsTo(Internship, { foreignKey: 'jobId', as: 'internship' });
Application.hasMany(ApplicationMessage, { foreignKey: 'applicationId', as: 'messages' });
ApplicationMessage.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });

export { sequelize, User, Company, Internship, Application, ApplicationMessage, ResumeAsset, Notification, EmailOtp, Payment, SystemSetting };
