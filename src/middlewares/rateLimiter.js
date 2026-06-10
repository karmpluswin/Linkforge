const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { redis } = require('../config/redis');

const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { singleCount: false },
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
    }),
  });
};

const globalLimiter = createLimiter(
  15 * 60 * 1000,
  100,
  'Too many requests. Please try again after 15 minutes.'
);

const authLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  'Too many auth attempts. Please try again after 15 minutes.'
);

const redirectLimiter = createLimiter(
  1 * 60 * 1000,
  30,
  'Too many redirects. Please slow down.'
);

module.exports = { globalLimiter, authLimiter, redirectLimiter };