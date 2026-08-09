const { createQueue } = require('./queueFactory');

const dailyBriefingQueue = createQueue('daily-briefing');

const enqueueDailyBriefing = (data, options = {}) =>
  dailyBriefingQueue.add('daily-briefing', data, options);

const getSchedulerId = (userId) => `daily-briefing:${userId}`;

const scheduleDailyBriefing = async ({ userId, dailyBriefTime, timezone, notificationEnabled }) => {
  const schedulerId = getSchedulerId(userId);

  if (!notificationEnabled || !dailyBriefTime) {
    await dailyBriefingQueue.removeJobScheduler(schedulerId);
    return { scheduled: false };
  }

  const [hour, minute] = dailyBriefTime.split(':').map(Number);
  await dailyBriefingQueue.upsertJobScheduler(
    schedulerId,
    { pattern: `0 ${minute} ${hour} * * *`, tz: timezone },
    { name: 'daily-briefing', data: { userId } },
  );

  return { scheduled: true, schedulerId };
};

module.exports = { dailyBriefingQueue, enqueueDailyBriefing, scheduleDailyBriefing };
