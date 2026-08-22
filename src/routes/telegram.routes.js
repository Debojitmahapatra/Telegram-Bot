const { Router } = require('express');
const telegramController = require('../controllers/telegram.controller');
const verifyTelegramWebhook = require('../middlewares/verifyTelegramWebhook');
const { webhookLimiter } = require('../middlewares/rateLimiter');

const router = Router();

router.post('/webhook', webhookLimiter, verifyTelegramWebhook, telegramController.receiveWebhook);

module.exports = router;
