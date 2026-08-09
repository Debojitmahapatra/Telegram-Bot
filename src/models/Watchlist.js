const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Watchlist = sequelize.define(
  'Watchlist',
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
    companyName: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: 'watchlists',
    timestamps: true,
    indexes: [{ unique: true, fields: ['userId', 'symbol'] }],
  },
);

module.exports = Watchlist;
