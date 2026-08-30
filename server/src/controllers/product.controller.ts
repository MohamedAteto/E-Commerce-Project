import { Request, Response, NextFunction } from 'express';
import { productService, ProductService } from '../services/product.service.js';
import { ProductQueryInput } from '../validators/product.validator.js';
import { ApiResponse } from '../types/api.js';

export class ProductController {
  constructor(private service: ProductService = productService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ProductQueryInput;
      const { products, meta } = await this.service.getProducts(query);

      const response: ApiResponse = {
        success: true,
        data: { products },
        meta,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { idOrSlug } = req.params;
      const isAdmin = req.user?.role === 'ADMIN';
      const product = await this.service.getProductByIdOrSlug(idOrSlug, !isAdmin);

      const response: ApiResponse = {
        success: true,
        data: { product },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.service.createProduct(req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Product created successfully',
        data: { product },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.service.updateProduct(id, req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Product updated successfully',
        data: { product },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.deleteProduct(id);

      const response: ApiResponse = {
        success: true,
        message: 'Product deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

export const productController = new ProductController();
