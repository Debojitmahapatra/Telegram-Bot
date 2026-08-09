const { createQueue } = require('./queueFactory');

const alertsQueue = createQueue('alerts');

const enqueueAlertEvaluation = (data, options = {}) =>
  alertsQueue.add('evaluate-alerts', data, options);

const scheduleAlertEvaluation = () =>
  alertsQueue.upsertJobScheduler(
    'active-alert-evaluation',
    { every: 15 * 60 * 1_000 },
    { name: 'evaluate-alerts', data: {} },
  );

module.exports = { alertsQueue, enqueueAlertEvaluation, scheduleAlertEvaluation };
