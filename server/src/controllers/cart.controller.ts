import { Request, Response, NextFunction } from 'express';
import { cartService, CartService } from '../services/cart.service.js';
import { ApiResponse } from '../types/api.js';

export class CartController {
  constructor(private service: CartService = cartService) {}

  getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const cart = await this.service.getCart(userId);

      const response: ApiResponse = {
        success: true,
        data: { cart },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  addItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const cart = await this.service.addItem(userId, req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Item added to cart',
        data: { cart },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { itemId } = req.params;
      const cart = await this.service.updateItem(userId, itemId, req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Cart item updated',
        data: { cart },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  removeItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { itemId } = req.params;
      const cart = await this.service.removeItem(userId, itemId);

      const response: ApiResponse = {
        success: true,
        message: 'Item removed from cart',
        data: { cart },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  clearCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const cart = await this.service.clearCart(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Cart cleared',
        data: { cart },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

export const cartController = new CartController();
