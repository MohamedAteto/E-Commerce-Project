import { Router } from 'express';
import { orderController } from '../controllers/order.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { createOrderSchema } from '../validators/order.validator.js';

export const orderRouter = Router();

orderRouter.use(requireAuth);

orderRouter.post('/', validateBody(createOrderSchema), orderController.checkout);
orderRouter.get('/', orderController.getMyOrders);
orderRouter.get('/:id', orderController.getOrder);
