const telegramWebhookService = require('../telegram/telegramWebhook.service');

const receiveWebhook = async (req, res, next) => {
  try {
    const result = await telegramWebhookService.processUpdate(req.body);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = { receiveWebhook };
