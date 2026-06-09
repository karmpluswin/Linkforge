const Analytics = require('./analytics.model');
const Url = require('../url/url.model');
const { sendSuccess, sendError } = require('../../utils/response');

const getSummary = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const userId = req.user.userId;

    const url = await Url.findOne({ shortCode, userId });
    if (!url) {
      return sendError(res, 404, 'URL not found');
    }

    const totalClicks = await Analytics.countDocuments({ shortCode });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyClicks = await Analytics.aggregate([
      {
        $match: {
          shortCode,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          clicks: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    sendSuccess(res, 200, 'Analytics summary fetched', {
      url: {
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
        isActive: url.isActive,
        createdAt: url.createdAt,
      },
      totalClicks,
      dailyClicks,
    });
  } catch (error) {
    next(error);
  }
};

const getClickLog = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const userId = req.user.userId;

    const url = await Url.findOne({ shortCode, userId });
    if (!url) {
      return sendError(res, 404, 'URL not found');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [clicks, total] = await Promise.all([
      Analytics.find({ shortCode })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Analytics.countDocuments({ shortCode }),
    ]);

    sendSuccess(res, 200, 'Click log fetched', {
      clicks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary, getClickLog };