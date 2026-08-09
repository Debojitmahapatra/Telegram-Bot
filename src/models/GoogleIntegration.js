const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GoogleIntegration = sequelize.define(
  'GoogleIntegration',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, unique: true },
    provider: { type: DataTypes.STRING, allowNull: false, defaultValue: 'gmail' },
    accessToken: { type: DataTypes.TEXT, allowNull: false },
    refreshToken: { type: DataTypes.TEXT, allowNull: true },
    expiryDate: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: 'google_integrations',
    timestamps: true,
    indexes: [{ unique: true, fields: ['userId', 'provider'] }],
  },
);

module.exports = GoogleIntegration;
