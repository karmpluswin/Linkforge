const Redis = require('ioredis');
const config = require('./env');

let redis;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
} else {
  redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    retryStrategy(times) {
      if (times > 3) {
        console.error('Redis max retries reached. Giving up.');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
  });
}

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
    console.log('Redis connection established');
  } catch (error) {
    console.error(`Redis connection failed: ${error.message}`);
  }
};

module.exports = { redis, connectRedis };