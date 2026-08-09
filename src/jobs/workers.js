require('dotenv').config();

const { Worker } = require('bullmq');
const { redisConnection, testRedisConnection } = require('../config/redis');
const { processFinancialUpdate } = require('./financialUpdates.job');
const { processDailyBriefing } = require('./dailyBriefing.job');
const { processAlertEvaluation } = require('./alerts.job');
const { processDocumentProcessing } = require('./documentProcessing.job');

const workerDefinitions = [
  ['financial-updates', processFinancialUpdate],
  ['daily-briefing', processDailyBriefing],
  ['alerts', processAlertEvaluation],
  ['document-processing', processDocumentProcessing],
];

let workers = [];

const stopWorkers = async () => {
  await Promise.all(workers.map((worker) => worker.close()));
  process.exit(0);
};

process.on('SIGINT', stopWorkers);
process.on('SIGTERM', stopWorkers);

const startWorkers = async () => {
  try {
    await testRedisConnection();
    workers = workerDefinitions.map(
      ([queueName, processor]) => new Worker(queueName, processor, { connection: redisConnection }),
    );
    console.log('BullMQ workers are running.');
  } catch (error) {
    console.error('Redis connection could not be established:', error.message);
    process.exit(1);
  }
};

startWorkers();
