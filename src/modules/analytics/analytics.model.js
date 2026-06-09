const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Url',
      required: true,
    },
    shortCode: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      default: 'unknown',
    },
    userAgent: {
      type: String,
      default: 'unknown',
    },
    referer: {
      type: String,
      default: 'direct',
    },
  },
  {
    timestamps: true,
  }
);

analyticsSchema.index({ shortCode: 1 });
analyticsSchema.index({ urlId: 1 });
analyticsSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);