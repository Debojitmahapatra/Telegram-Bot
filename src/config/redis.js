const Redis = require('ioredis');

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
};

if (process.env.REDIS_PASSWORD) {
  redisConnection.password = process.env.REDIS_PASSWORD;
}

const testRedisConnection = async () => {
  const client = new Redis({
    ...redisConnection,
    lazyConnect: true,
    connectTimeout: 5_000,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });
  client.on('error', () => {});

  try {
    await client.connect();
    await client.ping();
    console.log('Redis connection established.');
  } finally {
    client.disconnect();
  }
};

module.exports = { redisConnection, testRedisConnection };
