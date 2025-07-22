import 'reflect-metadata';
import { app } from './app';
import { config } from '@/config/config';
import { logger } from '@/utils/logger';
import { initializeDatabase } from '@/config/database';

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    // Start server
    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
      logger.info(`📚 API Documentation available at http://localhost:${config.PORT}/api/${config.API_VERSION}`);
      logger.info(`❤️  Health check available at http://localhost:${config.PORT}/health`);
      logger.info(`💾 Database connected and ready`);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

const serverPromise = startServer();

// Handle shutdown gracefully
let server: any;

serverPromise.then((serverInstance) => {
  server = serverInstance;
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', {
    error: err.message,
    stack: err.stack,
  });
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  if (server) {
    server.close(() => {
      logger.info('💥 Process terminated!');
    });
  } else {
    process.exit(0);
  }
});

export { serverPromise };