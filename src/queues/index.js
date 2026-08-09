const { financialUpdatesQueue, enqueueFinancialUpdate } = require('./financialUpdates.queue');
const { dailyBriefingQueue, enqueueDailyBriefing, scheduleDailyBriefing } = require('./dailyBriefing.queue');
const { alertsQueue, enqueueAlertEvaluation, scheduleAlertEvaluation } = require('./alerts.queue');
const { documentProcessingQueue, enqueueDocumentProcessing } = require('./documentProcessing.queue');

module.exports = {
  financialUpdatesQueue,
  dailyBriefingQueue,
  alertsQueue,
  documentProcessingQueue,
  enqueueFinancialUpdate,
  enqueueDailyBriefing,
  scheduleDailyBriefing,
  enqueueAlertEvaluation,
  scheduleAlertEvaluation,
  enqueueDocumentProcessing,
};
