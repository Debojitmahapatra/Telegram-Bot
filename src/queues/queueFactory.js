const { Queue } = require('bullmq');
const { redisConnection } = require('../config/redis');

const createQueue = (name) =>
  new Queue(name, {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1_000 },
      removeOnComplete: 1_000,
      removeOnFail: 5_000,
    },
  });

module.exports = { createQueue };
