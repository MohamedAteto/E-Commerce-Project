import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { updateOrderStatusSchema } from '../validators/order.validator.js';

export const adminRouter = Router();

// Protect all admin routes with authentication & role-based admin guard
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/stats', adminController.getStats);
adminRouter.get('/orders', adminController.getAllOrders);
adminRouter.patch('/orders/:id/status', validateBody(updateOrderStatusSchema), adminController.updateOrderStatus);
adminRouter.get('/users', adminController.getAllUsers);
