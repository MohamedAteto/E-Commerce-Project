import { Router } from 'express';
import { cartController } from '../controllers/cart.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { addCartItemSchema, updateCartItemSchema } from '../validators/cart.validator.js';

export const cartRouter = Router();

// All cart management endpoints require authentication
cartRouter.use(requireAuth);

cartRouter.get('/', cartController.getCart);
cartRouter.post('/items', validateBody(addCartItemSchema), cartController.addItem);
cartRouter.patch('/items/:itemId', validateBody(updateCartItemSchema), cartController.updateItem);
cartRouter.delete('/items/:itemId', cartController.removeItem);
cartRouter.delete('/', cartController.clearCart);
