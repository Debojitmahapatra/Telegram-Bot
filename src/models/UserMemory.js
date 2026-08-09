const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserMemory = sequelize.define(
  'UserMemory',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    memoryType: { type: DataTypes.STRING, allowNull: false },
    memoryKey: { type: DataTypes.STRING, allowNull: false },
    memoryValue: { type: DataTypes.TEXT, allowNull: false },
    confidence: { type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 0.8 },
  },
  {
    tableName: 'user_memories',
    timestamps: true,
    indexes: [{ unique: true, fields: ['userId', 'memoryType', 'memoryKey'] }],
  },
);

module.exports = UserMemory;
