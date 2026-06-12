const mongoose = require('mongoose');
const config = require('./env');

const ensureGuestUser = async () => {
  const User = require('../modules/auth/user.model');
  const existing = await User.findOne({ email: 'guest@linkforge.app' });
  if (!existing) {
    await User.create({
      name: 'Guest',
      email: 'guest@linkforge.app',
      password: 'guest_password_not_used_' + Math.random(),
      plan: 'free',
    });
    console.log('Guest user created');
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodbUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    await ensureGuestUser();
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB error: ${err.message}`);
});

module.exports = connectDB;