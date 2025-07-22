import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { config } from '@/config/config';
import { logger } from '@/utils/logger';
import { globalErrorHandler, AppError } from '@/middleware/errorHandler';
import healthRoutes from '@/routes/health';
import docsRoutes from '@/routes/docs';
import todoRoutes from '@/routes/simple-todos-db';

const app: Application = express();

// Trust proxy (for load balancers, reverse proxies)
app.set('trust proxy', 1);

// Global OPTIONS handler for CORS preflight - MUST be before other middleware
app.options('*', (req: Request, res: Response) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(200);
});

// Security middleware - Disabled for development
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
//       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Swagger UI needs unsafe-eval
//       imgSrc: ["'self'", "data:", "https:", "https://validator.swagger.io"],
//       fontSrc: ["'self'", "https://fonts.gstatic.com"],
//       connectSrc: ["'self'", "https://validator.swagger.io"],
//     },
//   },
// }));

// CORS configuration - Manual implementation for maximum compatibility
app.use((req: Request, res: Response, next: NextFunction) => {
  // Set CORS headers for all requests
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-API-Key');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  return next();
});

// Rate limiting - Disabled for development
// const limiter = rateLimit({
//   windowMs: config.RATE_LIMIT_WINDOW_MS,
//   max: config.RATE_LIMIT_MAX_REQUESTS,
//   message: {
//     status: 'error',
//     message: 'Too many requests from this IP, please try again later.',
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });
  return next();
});

// Routes
app.use('/health', healthRoutes);
app.use('/docs', docsRoutes);

// API routes (both with and without /api prefix for frontend compatibility)
app.use(`/api/${config.API_VERSION}/todos`, todoRoutes);
app.use(`/${config.API_VERSION}/todos`, todoRoutes);

// API root endpoint
app.use(`/api/${config.API_VERSION}`, (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    message: 'TODO Service API',
    version: config.API_VERSION,
    timestamp: new Date().toISOString(),
    documentation: '/docs',
    endpoints: {
      todos: `/api/${config.API_VERSION}/todos`,
      health: '/health'
    }
  });
});

// Catch unhandled routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

export { app };