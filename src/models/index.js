const User = require('./User');
const UserPreference = require('./UserPreference');
const Conversation = require('./Conversation');
const Message = require('./Message');
const Watchlist = require('./Watchlist');
const Alert = require('./Alert');
const FinancialDocument = require('./FinancialDocument');
const DocumentChunk = require('./DocumentChunk');
const UserMemory = require('./UserMemory');
const GoogleIntegration = require('./GoogleIntegration');

User.hasOne(UserPreference, {
  foreignKey: 'userId',
  as: 'preference',
  onDelete: 'CASCADE',
});
UserPreference.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(Conversation, {
  foreignKey: 'userId',
  as: 'conversations',
  onDelete: 'CASCADE',
});
Conversation.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Conversation.hasMany(Message, {
  foreignKey: 'conversationId',
  as: 'messages',
  onDelete: 'CASCADE',
});
Message.belongsTo(Conversation, {
  foreignKey: 'conversationId',
  as: 'conversation',
});

User.hasMany(Watchlist, {
  foreignKey: 'userId',
  as: 'watchlistItems',
  onDelete: 'CASCADE',
});
Watchlist.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(Alert, {
  foreignKey: 'userId',
  as: 'alerts',
  onDelete: 'CASCADE',
});
Alert.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(FinancialDocument, {
  foreignKey: 'userId',
  as: 'financialDocuments',
  onDelete: 'CASCADE',
});
FinancialDocument.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

FinancialDocument.hasMany(DocumentChunk, {
  foreignKey: 'documentId',
  as: 'chunks',
  onDelete: 'CASCADE',
});
DocumentChunk.belongsTo(FinancialDocument, {
  foreignKey: 'documentId',
  as: 'document',
});

User.hasMany(UserMemory, {
  foreignKey: 'userId',
  as: 'memories',
  onDelete: 'CASCADE',
});
UserMemory.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasOne(GoogleIntegration, {
  foreignKey: 'userId',
  as: 'googleIntegration',
  onDelete: 'CASCADE',
});
GoogleIntegration.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

module.exports = {
  User,
  UserPreference,
  Conversation,
  Message,
  Watchlist,
  Alert,
  FinancialDocument,
  DocumentChunk,
  UserMemory,
  GoogleIntegration,
};
