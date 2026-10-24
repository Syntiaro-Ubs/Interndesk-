import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },
  userEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null
  },
  title: {
    type: DataTypes.STRING(512),
    defaultValue: ''
  },
  message: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  status: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: null
  },
  jobId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },
  company: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'notifications',
  timestamps: true
});

export default Notification;
