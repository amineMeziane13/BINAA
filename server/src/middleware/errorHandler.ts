import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors.js';
import { logger } from './logger.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  logger.error('Global', err.message, { path: req.path, method: req.method });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({ error: 'Database operation failed' });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
