const QRCode = require('qrcode');
const Url = require('./url.model');
const { sendError } = require('../../utils/response');
const config = require('../../config/env');

const generateQR = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const url = await Url.findOne({ _id: id, userId });
    if (!url) {
      return sendError(res, 404, 'URL not found');
    }

    const shortUrl = `${config.baseUrl}/${url.shortCode}`;

    const qrBuffer = await QRCode.toBuffer(shortUrl, {
      type: 'png',
      width: 300,
      margin: 2,
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="qr-${url.shortCode}.png"`);
    res.send(qrBuffer);
  } catch (error) {
    next(error);
  }
};

module.exports = { generateQR };