const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Alert = sequelize.define(
  'Alert',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    symbol: {
      type: DataTypes.STRING(10),
      allowNull: false,
      set(value) {
        this.setDataValue('symbol', value.trim().toUpperCase());
      },
    },
    alertType: { type: DataTypes.ENUM('price_movement', 'important_news'), allowNull: false },
    condition: { type: DataTypes.STRING, allowNull: false },
    threshold: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    lastTriggeredAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: 'alerts',
    timestamps: true,
    indexes: [{ fields: ['userId', 'isActive'] }, { fields: ['symbol', 'isActive'] }],
  },
);

module.exports = Alert;
