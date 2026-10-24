import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ''
  },
  domain: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  industry: {
    type: DataTypes.STRING(255),
    defaultValue: 'Software & Technology'
  },
  location: {
    type: DataTypes.STRING(255),
    defaultValue: 'Bengaluru, India'
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 4.5
  },
  reviewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  openPositionsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  tagline: {
    type: DataTypes.STRING(512),
    defaultValue: ''
  },
  logoColor: {
    type: DataTypes.STRING(50),
    defaultValue: '#0A66C2'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  verificationStatus: {
    type: DataTypes.STRING(50),
    defaultValue: 'verified'
  },
  website: {
    type: DataTypes.STRING(512),
    defaultValue: ''
  },
  recruiterName: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  recruiterEmail: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  recruiterDesignation: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  }
}, {
  tableName: 'companies',
  timestamps: true
});

export default Company;
