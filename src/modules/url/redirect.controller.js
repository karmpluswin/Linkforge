const Url = require('./url.model');
const Analytics = require('../analytics/analytics.model');
const { redis } = require('../../config/redis');
const { sendError } = require('../../utils/response');

const CACHE_TTL = 3600;

const redirectUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const cacheKey = `url:${shortCode}`;

    let urlData = null;
    const cached = await redis.get(cacheKey);

    if (cached) {
      urlData = JSON.parse(cached);
    } else {
      const url = await Url.findOne({ shortCode });

      if (!url) {
        return sendError(res, 404, 'Short URL not found');
      }

      urlData = {
        originalUrl: url.originalUrl,
        isActive: url.isActive,
        expiresAt: url.expiresAt,
        id: url._id.toString(),
      };

      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(urlData));
    }

    if (!urlData.isActive) {
      return sendError(res, 410, 'This link has been deactivated');
    }

    if (urlData.expiresAt && new Date(urlData.expiresAt) < new Date()) {
      return sendError(res, 410, 'This link has expired');
    }

    Url.findByIdAndUpdate(urlData.id, { $inc: { clickCount: 1 } }).catch((err) =>
      console.error('Failed to increment click count:', err.message)
    );

    Analytics.create({
      urlId: urlData.id,
      shortCode,
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      referer: req.headers['referer'] || 'direct',
    }).catch((err) =>
      console.error('Failed to record analytics:', err.message)
    );

    return res.redirect(302, urlData.originalUrl);
  } catch (error) {
    next(error);
  }
};

module.exports = { redirectUrl };