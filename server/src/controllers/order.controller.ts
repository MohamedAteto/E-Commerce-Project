import { Request, Response, NextFunction } from 'express';
import { orderService, OrderService } from '../services/order.service.js';
import { orderQuerySchema } from '../validators/order.validator.js';
import { ApiResponse } from '../types/api.js';

export class OrderController {
  constructor(private service: OrderService = orderService) {}

  checkout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const order = await this.service.checkout(userId, req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Order created successfully',
        data: { order },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getMyOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const query = orderQuerySchema.parse(req.query);
      const { orders, meta } = await this.service.getCustomerOrders(userId, query.page, query.limit);

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

  getOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user!;
      const order = await this.service.getOrderById(id, user);

      const response: ApiResponse = {
        success: true,
        data: { order },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

export const orderController = new OrderController();
