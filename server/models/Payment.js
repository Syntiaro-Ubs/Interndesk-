import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },
  userEmail: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  userPhone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  draftId: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  txnid: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  payuMoneyId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  bankRefNum: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 99.00
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'INR'
  },
  status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  paymentMode: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  invoiceNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  productInfo: {
    type: DataTypes.STRING(255),
    defaultValue: 'ATS resume PDF download'
  },
  rawResponse: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true
});

export default Payment;
