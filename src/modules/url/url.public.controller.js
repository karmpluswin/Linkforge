const Url = require('./url.model');
const User = require('../auth/user.model');
const { generateShortCode } = require('../../utils/shortCode');
const { sendSuccess, sendError } = require('../../utils/response');
const config = require('../../config/env');

const createPublicUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias } = req.body;

    const guestUser = await User.findOne({ email: 'guest@linkforge.app' });
    if (!guestUser) {
      return sendError(res, 500, 'Service unavailable');
    }

    let shortCode;

    if (customAlias) {
      const existing = await Url.findOne({ customAlias });
      if (existing) {
        return sendError(res, 409, 'Custom alias already taken');
      }
      shortCode = customAlias;
    } else {
      shortCode = await generateShortCode();
    }

    const url = await Url.create({
      userId: guestUser._id,
      originalUrl,
      shortCode,
      customAlias: customAlias || null,
      expiresAt: null,
    });

    sendSuccess(res, 201, 'Short URL created successfully', {
      id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${config.baseUrl}/${url.shortCode}`,
      customAlias: url.customAlias,
      expiresAt: url.expiresAt,
      clickCount: url.clickCount,
      isActive: url.isActive,
      createdAt: url.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPublicUrl };