import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    set(val) { this.setDataValue('email', val?.toLowerCase().trim()); }
  },
  password: {
    type: DataTypes.STRING(512),
    defaultValue: ''
  },
  name: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  firstName: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  lastName: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  role: {
    type: DataTypes.ENUM('student', 'company', 'admin'),
    defaultValue: 'student'
  },
  companyId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    defaultValue: null
  },
  companyName: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  companyDomain: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  designation: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  profileComplete: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  avatar: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  coverImage: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(50),
    defaultValue: ''
  },
  college: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  degree: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  gradYear: {
    type: DataTypes.STRING(50),
    defaultValue: ''
  },
  cgpa: {
    type: DataTypes.STRING(50),
    defaultValue: ''
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  skills: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      try { return JSON.parse(this.getDataValue('skills') || '[]'); } catch { return []; }
    },
    set(val) {
      this.setDataValue('skills', JSON.stringify(Array.isArray(val) ? val : []));
    }
  },
  resumeKey: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  profileData: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    get() {
      try { return JSON.parse(this.getDataValue('profileData') || '{}'); } catch { return {}; }
    },
    set(val) {
      this.setDataValue('profileData', JSON.stringify(val || {}));
    }
  }
}, {
  tableName: 'users',
  timestamps: true
});

export default User;
