const { Alert, User } = require('../models');
const financialData = require('../integrations/financial/financialData.service');
const telegramApi = require('../telegram/telegramApi.service');

const COOLDOWN_MS = 24 * 60 * 60 * 1_000;

const canTrigger = (alert) => !alert.lastTriggeredAt || Date.now() - alert.lastTriggeredAt.getTime() >= COOLDOWN_MS;

const evaluatePriceMovement = async (alert) => {
  const quote = await financialData.getStockPrice(alert.symbol);
  const movement = Math.abs(Number(quote.changesPercentage));
  if (!Number.isFinite(movement) || movement < Number(alert.threshold)) return null;
  return `${alert.symbol} has moved ${quote.changesPercentage}% today (current price: ${quote.price}).`;
};

const evaluateImportantNews = async (alert) => {
  const news = await financialData.getCompanyNews(alert.symbol);
  const watermark = alert.lastTriggeredAt || alert.createdAt;
  const latest = news.find((item) => new Date(item.publishedDate) > watermark);
  if (!latest) return null;
  return `New ${alert.symbol} news: ${latest.title}\n${latest.url}`;
};

const processAlertEvaluation = async () => {
  const alerts = await Alert.findAll({ where: { isActive: true } });
  let triggered = 0;

  for (const alert of alerts) {
    if (!canTrigger(alert)) continue;

    try {
      const message =
        alert.alertType === 'price_movement'
          ? await evaluatePriceMovement(alert)
          : await evaluateImportantNews(alert);
      if (!message) continue;

      const user = await User.findByPk(alert.userId);
      if (!user) continue;
      await telegramApi.sendMessage(user.telegramId, message);
      await alert.update({ lastTriggeredAt: new Date() });
      triggered += 1;
    } catch (error) {
      console.error(`Alert evaluation failed for alert ${alert.id}:`, error.message);
    }
  }

  return { status: 'completed', evaluated: alerts.length, triggered };
};

module.exports = { processAlertEvaluation };
