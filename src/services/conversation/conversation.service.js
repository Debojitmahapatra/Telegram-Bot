const { Conversation, Message, User } = require('../../models');
const AppError = require('../../utils/AppError');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

const ensureUserExists = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError('User not found', 404);
};

const getConversationOrThrow = async (id) => {
  const conversation = await Conversation.findByPk(id);
  if (!conversation) throw new AppError('Conversation not found', 404);
  return conversation;
};

const createConversation = async ({ userId, title }) => {
  await ensureUserExists(userId);
  return Conversation.create({ userId, title });
};

const listConversations = async (userId, pageValue, limitValue) => {
  await ensureUserExists(userId);
  const { page, limit, offset } = getPagination(pageValue, limitValue);
  const { count, rows } = await Conversation.findAndCountAll({
    where: { userId },
    order: [['updatedAt', 'DESC']],
    limit,
    offset,
  });

  return { conversations: rows, pagination: getPaginationMeta(count, page, limit) };
};

const getConversation = async (id) => getConversationOrThrow(id);

const getOrCreateLatestConversation = async (userId, transaction) => {
  const conversation = await Conversation.findOne({
    where: { userId },
    order: [['updatedAt', 'DESC']],
    transaction,
  });

  if (conversation) return conversation;

  return Conversation.create({ userId, title: 'Telegram conversation' }, { transaction });
};

const listMessages = async (conversationId, pageValue, limitValue) => {
  await getConversationOrThrow(conversationId);
  const { page, limit, offset } = getPagination(pageValue, limitValue);
  const { count, rows } = await Message.findAndCountAll({
    where: { conversationId },
    order: [['createdAt', 'ASC']],
    limit,
    offset,
  });

  return { messages: rows, pagination: getPaginationMeta(count, page, limit) };
};

const getRecentMessages = async (conversationId, limit = 20) => {
  const messages = await Message.findAll({
    where: { conversationId },
    order: [['createdAt', 'DESC']],
    limit,
  });

  return messages.reverse();
};

module.exports = {
  createConversation,
  listConversations,
  getConversation,
  listMessages,
  getOrCreateLatestConversation,
  getRecentMessages,
};
