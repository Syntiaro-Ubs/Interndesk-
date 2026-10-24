import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ApplicationMessage = sequelize.define('ApplicationMessage', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  applicationId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  senderEmail: { type: DataTypes.STRING(255), allowNull: false },
  senderName: { type: DataTypes.STRING(255), allowNull: false, defaultValue: 'User' },
  senderRole: { type: DataTypes.STRING(20), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false }
}, { tableName: 'application_messages', timestamps: true });

export default ApplicationMessage;
