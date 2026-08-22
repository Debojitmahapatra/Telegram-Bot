const crypto = require('crypto');
const AppError = require('../utils/AppError');

const verifyTelegramWebhook = (req, res, next) => {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expectedSecret) return next();

  const receivedSecret = req.get('x-telegram-bot-api-secret-token') || '';
  const expectedBuffer = Buffer.from(expectedSecret);
  const receivedBuffer = Buffer.from(receivedSecret);

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    return next(new AppError('Unauthorized Telegram webhook request', 401));
  }

  next();
};

module.exports = verifyTelegramWebhook;
