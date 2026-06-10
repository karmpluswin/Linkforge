const Redis = require('ioredis');
const config = require('./env');

const Redis = require('ioredis');
const config = require('./env');

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { lazyConnect: true })
  : new Redis({
      host: config.redis.host,
      port: config.redis.port,
      lazyConnect: true,
    });

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error(`Redis error: ${err.message}`);
});

redis.on('close', () => {
  console.warn('Redis connection closed');
});

const connectRedis = async () => {
  try {
    await redis.connect();
  } catch (error) {
    console.error(`Redis connection failed: ${error.message}`);
  }
};

module.exports = { redis, connectRedis };