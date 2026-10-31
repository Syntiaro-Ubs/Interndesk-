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

// ── Associations ─────────────────────────────────────────────
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

// User has many Applications (student)
User.hasMany(Application, { foreignKey: 'studentId', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

export { sequelize, User, Company, Internship, Application, ApplicationMessage, ResumeAsset, Notification };
