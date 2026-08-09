const { Router } = require('express');
const telegramController = require('../controllers/telegram.controller');

const router = Router();

router.post('/webhook', telegramController.receiveWebhook);

module.exports = router;
