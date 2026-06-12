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
const { globalLimiter, authLimiter, redirectLimiter } = require('./middlewares/rateLimiter');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger/swagger.js');

const app = express();

app.use(helmet());

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://linkforge-fayx.onrender.com',
    'https://linkforge-online.vercel.app/',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(globalLimiter);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'linkforge-api',
    timestamp: new Date().toISOString(),
  });
});

app.get('/:shortCode', redirectLimiter, redirectUrl);

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/urls', urlRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;