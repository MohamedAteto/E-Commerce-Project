import { Request, Response } from 'express';
import { ApiResponse } from '../types/api.js';

export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  };

  res.status(404).json(response);
}
