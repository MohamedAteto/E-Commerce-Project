import { Router } from 'express';
import { productController } from '../controllers/product.controller.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middlewares/auth.middleware.js';
import { validateBody, validateQuery } from '../middlewares/validate.middleware.js';
import { productQuerySchema, createProductSchema, updateProductSchema } from '../validators/product.validator.js';

export const productRouter = Router();

// Public routes (with optional auth so admin can view inactive products if needed)
productRouter.get('/', validateQuery(productQuerySchema), productController.getAll);
productRouter.get('/:idOrSlug', optionalAuth, productController.getOne);

// Protected Admin routes
productRouter.post('/', requireAuth, requireAdmin, validateBody(createProductSchema), productController.create);
productRouter.put('/:id', requireAuth, requireAdmin, validateBody(updateProductSchema), productController.update);
productRouter.delete('/:id', requireAuth, requireAdmin, productController.delete);
