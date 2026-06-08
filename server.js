require('./src/config/env');

const app = require('./src/app');
const connectDB = require('./src/config/database');
const config = require('./src/config/env');

const startServer = async () => {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`Health check: http://localhost:${config.port}/health`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  });
};

startServer();