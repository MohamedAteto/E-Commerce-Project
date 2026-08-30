import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types/api.js';

export const healthRouter = Router();

healthRouter.get('/health', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'E-Commerce API service is healthy and operational',
    data: {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    },
  };
  res.status(200).json(response);
});
