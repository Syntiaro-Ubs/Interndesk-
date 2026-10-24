import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Internship = sequelize.define('Internship', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
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
  logo: {
    type: DataTypes.STRING(10),
    defaultValue: 'CO'
  },
  logoColor: {
    type: DataTypes.STRING(50),
    defaultValue: '#0A66C2'
  },
  location: {
    type: DataTypes.STRING(255),
    defaultValue: 'Remote'
  },
  workMode: {
    type: DataTypes.STRING(50),
    defaultValue: 'Remote'
  },
  mode: {
    type: DataTypes.STRING(50),
    defaultValue: 'Remote'
  },
  stipend: {
    type: DataTypes.STRING(100),
    defaultValue: 'Unpaid'
  },
  stipendNum: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  stipendAmount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  stipendCurrency: {
    type: DataTypes.STRING(10),
    defaultValue: 'INR'
  },
  stipendPeriod: {
    type: DataTypes.STRING(20),
    defaultValue: 'month'
  },
  duration: {
    type: DataTypes.STRING(50),
    defaultValue: '3 Months'
  },
  category: {
    type: DataTypes.STRING(50),
    defaultValue: 'IT'
  },
  department: {
    type: DataTypes.STRING(255),
    defaultValue: 'Software Development'
  },
  // JSON arrays stored as TEXT
  skills: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      try { return JSON.parse(this.getDataValue('skills') || '[]'); } catch { return []; }
    },
    set(val) {
      this.setDataValue('skills', JSON.stringify(Array.isArray(val) ? val : []));
    }
  },
  perks: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      try { return JSON.parse(this.getDataValue('perks') || '[]'); } catch { return []; }
    },
    set(val) {
      this.setDataValue('perks', JSON.stringify(Array.isArray(val) ? val : []));
    }
  },
  postedDate: {
    type: DataTypes.STRING(100),
    defaultValue: 'Just now'
  },
  posted: {
    type: DataTypes.STRING(100),
    defaultValue: 'Today'
  },
  ago: {
    type: DataTypes.STRING(100),
    defaultValue: 'Just now'
  },
  openings: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  responsibilities: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  eligibility: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'Active'
  },
  applicants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  minCgpa: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  selectionSteps: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      try { return JSON.parse(this.getDataValue('selectionSteps') || '[]'); } catch { return []; }
    },
    set(val) {
      this.setDataValue('selectionSteps', JSON.stringify(Array.isArray(val) ? val : []));
    }
  }
}, {
  tableName: 'internships',
  timestamps: true
});

export default Internship;
