const conversationService = require('../services/conversation/conversation.service');

const createConversation = async (req, res, next) => {
  try {
    const conversation = await conversationService.createConversation(req.body);
    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

const listConversations = async (req, res, next) => {
  try {
    const data = await conversationService.listConversations(req.query.userId, req.query.page, req.query.limit);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getConversation = async (req, res, next) => {
  try {
    const conversation = await conversationService.getConversation(req.params.id);
    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

const listMessages = async (req, res, next) => {
  try {
    const data = await conversationService.listMessages(req.params.id, req.query.page, req.query.limit);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { createConversation, listConversations, getConversation, listMessages };
