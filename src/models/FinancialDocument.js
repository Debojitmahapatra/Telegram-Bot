const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FinancialDocument = sequelize.define(
  'FinancialDocument',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    fileName: { type: DataTypes.STRING, allowNull: false },
    filePath: { type: DataTypes.STRING, allowNull: false },
    mimeType: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    summary: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: 'financial_documents',
    timestamps: true,
    indexes: [{ fields: ['userId', 'status'] }],
  },
);

module.exports = FinancialDocument;
