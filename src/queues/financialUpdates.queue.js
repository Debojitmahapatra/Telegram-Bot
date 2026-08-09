const { createQueue } = require('./queueFactory');

const financialUpdatesQueue = createQueue('financial-updates');

const enqueueFinancialUpdate = (data, options = {}) =>
  financialUpdatesQueue.add('financial-update', data, options);

module.exports = { financialUpdatesQueue, enqueueFinancialUpdate };
