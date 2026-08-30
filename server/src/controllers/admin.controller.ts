import { Request, Response, NextFunction } from 'express';
import { orderService, OrderService } from '../services/order.service.js';
import { userRepository, UserRepository } from '../repositories/user.repository.js';
import { orderQuerySchema } from '../validators/order.validator.js';
import { ApiResponse } from '../types/api.js';

export class AdminController {
  constructor(
    private ordService: OrderService = orderService,
    private userRepo: UserRepository = userRepository
  ) {}

  getAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = orderQuerySchema.parse(req.query);
      const { orders, meta } = await this.ordService.getAdminOrders(query.page, query.limit, query.status);

      const response: ApiResponse = {
        success: true,
        data: { orders },
        meta,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await this.ordService.updateOrderStatus(id, status);

      const response: ApiResponse = {
        success: true,
        message: `Order status updated to ${status}`,
        data: { order },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.ordService.getAdminStats();

      const response: ApiResponse = {
        success: true,
        data: { stats },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userRepo.findAll();
      const safeUsers = users.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        createdAt: u.createdAt,
      }));

      const response: ApiResponse = {
        success: true,
        data: { users: safeUsers },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

export const adminController = new AdminController();
