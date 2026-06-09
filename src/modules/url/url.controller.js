const Url = require('./url.model');
const { generateShortCode } = require('../../utils/shortCode');
const { sendSuccess, sendError } = require('../../utils/response');
const config = require('../../config/env');

const createUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;
    const userId = req.user.userId;

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
      userId,
      originalUrl,
      shortCode,
      customAlias: customAlias || null,
      expiresAt: expiresAt || null,
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

const getMyUrls = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const urls = await Url.find({ userId }).sort({ createdAt: -1 });

    sendSuccess(res, 200, 'URLs fetched successfully', { urls });
  } catch (error) {
    next(error);
  }
};

const getUrlById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const url = await Url.findOne({ _id: id, userId });
    if (!url) {
      return sendError(res, 404, 'URL not found');
    }

    sendSuccess(res, 200, 'URL fetched successfully', { url });
  } catch (error) {
    next(error);
  }
};

const updateUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const url = await Url.findOne({ _id: id, userId });
    if (!url) {
      return sendError(res, 404, 'URL not found');
    }

    if (req.body.customAlias && req.body.customAlias !== url.customAlias) {
      const existing = await Url.findOne({ customAlias: req.body.customAlias });
      if (existing) {
        return sendError(res, 409, 'Custom alias already taken');
      }
    }

    const updated = await Url.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    sendSuccess(res, 200, 'URL updated successfully', { url: updated });
  } catch (error) {
    next(error);
  }
};

const deleteUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const url = await Url.findOneAndDelete({ _id: id, userId });
    if (!url) {
      return sendError(res, 404, 'URL not found');
    }

    sendSuccess(res, 200, 'URL deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { createUrl, getMyUrls, getUrlById, updateUrl, deleteUrl };