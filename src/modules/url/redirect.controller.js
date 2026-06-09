const Url = require('./url.model');
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

    await Url.findByIdAndUpdate(urlData.id, { $inc: { clickCount: 1 } });

    return res.redirect(302, urlData.originalUrl);
  } catch (error) {
    next(error);
  }
};

module.exports = { redirectUrl };