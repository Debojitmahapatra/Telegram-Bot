const { User, UserPreference, Watchlist } = require('../models');
const telegramApi = require('../telegram/telegramApi.service');
const {
  generateDailyBriefing,
  isDeliverableBriefing,
  isScheduledBriefingTime,
} = require('../services/dailyBriefing/dailyBriefing.service');

const processDailyBriefing = async (job) => {
  const user = await User.findByPk(job.data.userId);
  const preferences = await UserPreference.findOne({ where: { userId: job.data.userId } });

  if (!user || !preferences || !preferences.notificationEnabled) {
    return { status: 'skipped', reason: 'User is not eligible for briefings' };
  }
  if (!isScheduledBriefingTime(preferences.dailyBriefTime, preferences.timezone)) {
    return { status: 'skipped', reason: 'Job did not run at the user’s configured briefing time' };
  }

  const watchlistItems = await Watchlist.findAll({
    where: { userId: user.id },
    order: [['createdAt', 'ASC']],
    limit: 10,
  });
  if (!watchlistItems.length) {
    return { status: 'skipped', reason: 'User has no watchlist items' };
  }

  const briefing = await generateDailyBriefing({
    userId: user.id,
    preferences,
    watchlistItems,
  });
  if (!isDeliverableBriefing(briefing)) {
    return { status: 'skipped', reason: 'Briefing content is unavailable' };
  }

  await telegramApi.sendMessage(user.telegramId, briefing);
  return { status: 'sent', watchlistCount: watchlistItems.length };
};

module.exports = { processDailyBriefing };
