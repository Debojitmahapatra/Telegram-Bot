const gmailService = require('../integrations/google/gmail.service');

const startAuthorization = async (req, res, next) => {
  try {
    const authorizationUrl = await gmailService.getAuthorizationUrl(req.query.userId);
    res.status(200).json({ success: true, data: { authorizationUrl } });
  } catch (error) {
    next(error);
  }
};

const completeAuthorization = async (req, res, next) => {
  try {
    await gmailService.completeAuthorization(req.query);
    res.status(200).json({ success: true, message: 'Gmail connected successfully. You can return to Telegram.' });
  } catch (error) {
    next(error);
  }
};

const searchEmails = async (req, res, next) => {
  try {
    const emails = await gmailService.searchEmails(req.body.userId, req.body.query);
    res.status(200).json({ success: true, data: emails });
  } catch (error) {
    next(error);
  }
};

const analyzeEmails = (task) => async (req, res, next) => {
  try {
    const data = await gmailService.summarizeEmails(req.body.userId, req.body.query, task);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startAuthorization,
  completeAuthorization,
  searchEmails,
  summarizeEmails: analyzeEmails('summarize'),
  companyConversations: analyzeEmails('company_conversations'),
  actionItems: analyzeEmails('action_items'),
};
