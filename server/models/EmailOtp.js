import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EmailOtp = sequelize.define('EmailOtp', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    set(val) { this.setDataValue('email', val?.toLowerCase().trim()); }
  },
  otp: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  consumed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'email_otps',
  timestamps: true,
  indexes: [
    { fields: ['email'] }
  ]
});

export default EmailOtp;

