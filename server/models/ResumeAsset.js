import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ResumeAsset = sequelize.define('ResumeAsset', {
  resumeKey: { type: DataTypes.STRING(100), primaryKey: true },
  ownerEmail: { type: DataTypes.STRING(255), allowNull: false },
  fileName: { type: DataTypes.STRING(255), allowNull: false },
  mimeType: { type: DataTypes.STRING(120), allowNull: false },
  dataBase64: { type: DataTypes.TEXT('long'), allowNull: false }
}, { tableName: 'resume_assets', timestamps: true });

export default ResumeAsset;
