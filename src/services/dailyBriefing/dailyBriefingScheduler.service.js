const { UserPreference } = require('../../models');
const { scheduleDailyBriefing } = require('../../queues/dailyBriefing.queue');

const syncDailyBriefingSchedule = async (preference) =>
  scheduleDailyBriefing({
    userId: preference.userId,
    dailyBriefTime: preference.dailyBriefTime,
    timezone: preference.timezone,
    notificationEnabled: preference.notificationEnabled,
  });

const syncAllDailyBriefingSchedules = async () => {
  const preferences = await UserPreference.findAll();
  await Promise.all(preferences.map(syncDailyBriefingSchedule));
  return preferences.length;
};

module.exports = { syncDailyBriefingSchedule, syncAllDailyBriefingSchedules };
