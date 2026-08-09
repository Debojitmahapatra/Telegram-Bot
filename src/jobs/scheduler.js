require('dotenv').config();

const { sequelize } = require('../config/database');
const { testRedisConnection } = require('../config/redis');
const { syncAllDailyBriefingSchedules } = require('../services/dailyBriefing/dailyBriefingScheduler.service');
const { scheduleAlertEvaluation } = require('../queues/alerts.queue');

const syncSchedules = async () => {
  const count = await syncAllDailyBriefingSchedules();
  console.log(`Daily briefing schedules synchronized for ${count} users.`);
};

const startScheduler = async () => {
  try {
    await sequelize.authenticate();
    await testRedisConnection();
    await syncSchedules();
    await scheduleAlertEvaluation();
    setInterval(() => {
      syncSchedules().catch((error) => console.error('Daily briefing schedule sync failed:', error.message));
    }, 5 * 60 * 1_000);
    console.log('Daily briefing scheduler is running.');
  } catch (error) {
    console.error('Daily briefing scheduler could not start:', error.message);
    process.exit(1);
  }
};

startScheduler();
