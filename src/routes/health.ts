import { Router, Request, Response } from 'express';
import { logger } from '@/utils/logger';

const router = Router();

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database?: 'healthy' | 'unhealthy' | 'unknown';
    [key: string]: string | undefined;
  };
}

/**
 * Basic health check endpoint
 */
router.get('/', (req: Request, res: Response) => {
  const health: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      // Database check will be added in Task 2
      database: 'unknown'
    }
  };

  logger.info('Health check performed', { 
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    uptime: health.uptime 
  });

  res.status(200).json(health);
});

/**
 * Readiness check endpoint for container orchestration
 */
router.get('/ready', (req: Request, res: Response) => {
  // In future tasks, we'll add checks for database connectivity
  // For now, just check if the app is running
  const isReady = process.uptime() > 5; // App needs to be running for at least 5 seconds

  if (isReady) {
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        startup: 'passed',
        database: 'pending' // Will be implemented in Task 2
      }
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      checks: {
        startup: 'failed',
        database: 'pending'
      }
    });
  }
});

/**
 * Liveness check endpoint for container orchestration
 */
router.get('/live', (req: Request, res: Response) => {
  // Basic liveness check - if we can respond, we're alive
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid,
    uptime: process.uptime()
  });
});

export default router;