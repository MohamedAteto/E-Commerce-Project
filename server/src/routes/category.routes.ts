import { Router } from 'express';
import { categoryController } from '../controllers/category.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator.js';

export const categoryRouter = Router();

// Public routes
categoryRouter.get('/', categoryController.getAll);
categoryRouter.get('/:id', categoryController.getOne);

// Protected Admin routes
categoryRouter.post('/', requireAuth, requireAdmin, validateBody(createCategorySchema), categoryController.create);
categoryRouter.put('/:id', requireAuth, requireAdmin, validateBody(updateCategorySchema), categoryController.update);
categoryRouter.delete('/:id', requireAuth, requireAdmin, categoryController.delete);
