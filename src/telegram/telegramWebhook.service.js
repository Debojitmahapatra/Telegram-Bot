const { sequelize } = require('../config/database');
const { Message, UserPreference, Conversation } = require('../models');
const userService = require('../services/user/user.service');
const conversationService = require('../services/conversation/conversation.service');
const telegramApi = require('./telegramApi.service');
const aiService = require('../services/ai/ai.service');
const memoryService = require('../services/memory/memory.service');

const extractContent = (message) => {
  if (message.text) return message.text.trim();
  if (message.voice) return '[Voice message]';
  if (message.photo) return '[Image message]';
  return null;
};

const processUpdate = async (update) => {
  const incomingMessage = update.message;
  console.log(update)
  if (!incomingMessage || !incomingMessage.from || !incomingMessage.chat) {
    return { ignored: true };
  }

  const content = extractContent(incomingMessage);
  if (!content) return { ignored: true };

  const { user, conversation } = await sequelize.transaction(async (transaction) => {
    const user = await userService.findOrCreateTelegramUser(incomingMessage.from, transaction);
    const conversation = await conversationService.getOrCreateLatestConversation(user.id, transaction);

    await Message.create(
      {
        conversationId: conversation.id,
        role: 'user',
        content,
        metadata: { telegramMessageId: incomingMessage.message_id },
      },
      { transaction },
    );
    await Conversation.update({ updatedAt: new Date() }, { where: { id: conversation.id }, transaction });
    return { user, conversation };
  });

  await memoryService.extractAndStoreMemories(user.id, content);

  const [conversationHistory, userPreferences, userMemory] = await Promise.all([
    conversationService.getRecentMessages(conversation.id, 20),
    UserPreference.findOne({ where: { userId: user.id } }),
    memoryService.getUserMemories(user.id),
  ]);
  const assistantResponse = await aiService.generateResponse({
    userMessage: content,
    conversationHistory: conversationHistory.slice(0, -1),
    userPreferences,
    userMemory,
    userId: user.id,
  });

  await sequelize.transaction(async (transaction) => {
    await Message.create(
      { conversationId: conversation.id, role: 'assistant', content: assistantResponse },
      { transaction },
    );
    await Conversation.update({ updatedAt: new Date() }, { where: { id: conversation.id }, transaction });
  });

  await telegramApi.sendMessage(incomingMessage.chat.id, assistantResponse);
  return { ignored: false };
};

module.exports = { processUpdate };
