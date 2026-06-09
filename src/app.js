const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const config = require('./config/env');

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

app.use(notFound);
app.use(errorHandler);

module.exports = app;