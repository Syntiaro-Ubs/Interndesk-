import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  jobId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  jobTitle: {
    type: DataTypes.STRING(255),
    defaultValue: 'Internship'
  },
  title: {
    type: DataTypes.STRING(255),
    defaultValue: 'Internship'
  },
  company: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  companyId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },
  logoColor: {
    type: DataTypes.STRING(50),
    defaultValue: '#0A66C2'
  },
  category: {
    type: DataTypes.STRING(50),
    defaultValue: 'IT'
  },
  status: {
    type: DataTypes.STRING(100),
    defaultValue: 'Under Review'
  },
  nextStep: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  studentId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },
  studentName: {
    type: DataTypes.STRING(255),
    defaultValue: 'Student Applicant'
  },
  name: {
    type: DataTypes.STRING(255),
    defaultValue: 'Student Applicant'
  },
  candidateEmail: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  candidatePhone: {
    type: DataTypes.STRING(50),
    defaultValue: ''
  },
  phone: {
    type: DataTypes.STRING(50),
    defaultValue: ''
  },
  college: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  course: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 88
  },
  resumeKey: {
    type: DataTypes.STRING(512),
    defaultValue: 'resume.pdf'
  },
  coverNote: {
    type: DataTypes.TEXT,
    defaultValue: ''
  }
}, {
  tableName: 'applications',
  timestamps: true
});

export default Application;
