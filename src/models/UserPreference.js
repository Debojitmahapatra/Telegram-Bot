const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserPreference = sequelize.define(
  'UserPreference',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    preferredIndustries: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    preferredCompanies: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    preferredTopics: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    dailyBriefTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    notificationEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'UTC',
    },
  },
  {
    tableName: 'user_preferences',
    timestamps: true,
    indexes: [{ unique: true, fields: ['userId'] }],
  },
);

module.exports = UserPreference;
