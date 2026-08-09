const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DocumentChunk = sequelize.define(
  'DocumentChunk',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    documentId: { type: DataTypes.UUID, allowNull: false },
    chunkIndex: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    tableName: 'document_chunks',
    timestamps: true,
    indexes: [{ unique: true, fields: ['documentId', 'chunkIndex'] }],
  },
);

module.exports = DocumentChunk;
