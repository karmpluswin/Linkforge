const { nanoid } = require('nanoid');
const Url = require('../modules/url/url.model');

const generateShortCode = async () => {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const code = nanoid(6);
    const existing = await Url.findOne({ shortCode: code });

    if (!existing) return code;

    console.warn(`Short code collision on attempt ${attempt}: ${code}`);
  }

  throw new Error('Failed to generate unique short code after 5 attempts');
};

module.exports = { generateShortCode };