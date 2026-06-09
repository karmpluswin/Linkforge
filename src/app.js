const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const config = require('./config/env');
const authRoutes = require('./modules/auth/auth.routes');
const urlRoutes = require('./modules/url/url.routes');
const { redirectUrl } = require('./modules/url/redirect.controller');
const analyticsRoutes = require('./modules/analytics/analytics.routes');

const app = express();

app.use(helmet());

app.use(cors({
  origin: config.nodeEnv === 'production' ? process.env.ALLOWED_ORIGINS : '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'linkforge-api',
    timestamp: new Date().toISOString(),
  });
});

app.get('/:shortCode', redirectUrl);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/urls', urlRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

const authenticate = require('./middlewares/authenticate');

app.get('/api/v1/me', authenticate, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;