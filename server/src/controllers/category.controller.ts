import { Request, Response, NextFunction } from 'express';
import { categoryService, CategoryService } from '../services/category.service.js';
import { ApiResponse } from '../types/api.js';

export class CategoryController {
  constructor(private service: CategoryService = categoryService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.service.getAllCategories();
      const response: ApiResponse = {
        success: true,
        data: { categories },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.service.getCategoryById(req.params.id);
      const response: ApiResponse = {
        success: true,
        data: { category },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.service.createCategory(req.body);
      const response: ApiResponse = {
        success: true,
        message: 'Category created successfully',
        data: { category },
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.service.updateCategory(req.params.id, req.body);
      const response: ApiResponse = {
        success: true,
        message: 'Category updated successfully',
        data: { category },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteCategory(req.params.id);
      const response: ApiResponse = {
        success: true,
        message: 'Category deleted successfully',
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

export const categoryController = new CategoryController();
