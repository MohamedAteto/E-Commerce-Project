import { prisma } from '../config/database.js';
import { orderRepository, OrderRepository, OrderWithItemsAndUser } from '../repositories/order.repository.js';
import { cartRepository, CartRepository } from '../repositories/cart.repository.js';
import { productRepository, ProductRepository } from '../repositories/product.repository.js';
import { userRepository, UserRepository } from '../repositories/user.repository.js';
import { CreateOrderInput } from '../validators/order.validator.js';
import { AppError, PaginationMeta } from '../types/api.js';

export class OrderService {
  constructor(
    private orderRepo: OrderRepository = orderRepository,
    private cartRepo: CartRepository = cartRepository,
    private productRepo: ProductRepository = productRepository,
    private userRepo: UserRepository = userRepository
  ) {}

  async checkout(userId: string, input: CreateOrderInput): Promise<OrderWithItemsAndUser> {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch user cart with items
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new AppError('Cannot place an order with an empty cart', 400, 'EMPTY_CART');
      }

      let subtotal = 0;
      const orderItemsToCreate: Array<{
        productId: string;
        productNameSnapshot: string;
        unitPriceSnapshot: number;
        quantity: number;
        totalPrice: number;
      }> = [];

      // 2. Validate availability and decrement stock safely under transaction
      for (const item of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.isActive) {
          throw new AppError(
            `Product "${item.product.name}" is currently unavailable for purchase.`,
            400,
            'PRODUCT_UNAVAILABLE'
          );
        }

        if (product.stock < item.quantity) {
          throw new AppError(
            `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}.`,
            400,
            'INSUFFICIENT_STOCK'
          );
        }

        // Decrement product inventory
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        const lineTotal = Number((item.quantity * product.price).toFixed(2));
        subtotal += lineTotal;

        orderItemsToCreate.push({
          productId: product.id,
          productNameSnapshot: product.name,
          unitPriceSnapshot: product.price,
          quantity: item.quantity,
          totalPrice: lineTotal,
        });
      }

      // 3. Authoritative calculation of tax, shipping, and total
      subtotal = Number(subtotal.toFixed(2));
      const tax = Number((subtotal * 0.08).toFixed(2)); // 8% tax
      const shippingCost = subtotal > 150 ? 0 : 15.0; // Free shipping over $150
      const totalAmount = Number((subtotal + tax + shippingCost).toFixed(2));

      // 4. Create Order Record
      const createdOrder = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          subtotal,
          tax,
          shippingCost,
          totalAmount,
          shippingAddress: JSON.stringify(input.shippingAddress),
          items: {
            create: orderItemsToCreate,
          },
        },
        include: {
          items: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // 5. Clear customer cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return createdOrder;
    });
  }

  async getCustomerOrders(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{ orders: OrderWithItemsAndUser[]; meta: PaginationMeta }> {
    const { orders, total } = await this.orderRepo.findByUserId(userId, { page, limit });
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      orders,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getOrderById(
    orderId: string,
    requestingUser: { userId: string; role: string }
  ): Promise<OrderWithItemsAndUser> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    if (requestingUser.role !== 'ADMIN' && order.userId !== requestingUser.userId) {
      throw new AppError('You do not have permission to view this order', 403, 'FORBIDDEN_ORDER_ACCESS');
    }

    return order;
  }

  async getAdminOrders(
    page = 1,
    limit = 10,
    status?: string
  ): Promise<{ orders: OrderWithItemsAndUser[]; meta: PaginationMeta }> {
    const { orders, total } = await this.orderRepo.findAll({ page, limit, status });
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      orders,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async updateOrderStatus(orderId: string, newStatus: string): Promise<OrderWithItemsAndUser> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    if (order.status === 'CANCELLED') {
      throw new AppError('Cannot modify status of an already cancelled order', 400, 'ORDER_ALREADY_CANCELLED');
    }

    // If cancelling, restore inventory in a transaction
    if (newStatus === 'CANCELLED' && order.status !== 'CANCELLED') {
      return prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }
        }

        return tx.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED' },
          include: {
            items: true,
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });
      });
    }

    return this.orderRepo.updateStatus(orderId, newStatus);
  }

  async getAdminStats() {
    const [metrics, lowStockCount, totalCustomers, recentOrders] = await Promise.all([
      this.orderRepo.getMetrics(),
      this.productRepo.countLowStock(5),
      this.userRepo.count(),
      this.orderRepo.getRecentOrders(5),
    ]);

    return {
      ...metrics,
      lowStockCount,
      totalCustomers,
      recentOrders,
    };
  }
}

export const orderService = new OrderService();
