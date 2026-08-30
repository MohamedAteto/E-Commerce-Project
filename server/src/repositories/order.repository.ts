import { prisma } from '../config/database.js';
import { Order, OrderItem, Prisma } from '@prisma/client';

export type OrderWithItemsAndUser = Order & {
  items: OrderItem[];
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
};

export class OrderRepository {
  async findById(id: string): Promise<OrderWithItemsAndUser | null> {
    return prisma.order.findUnique({
      where: { id },
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
  }

  async findByUserId(
    userId: string,
    params: { page: number; limit: number }
  ): Promise<{ orders: OrderWithItemsAndUser[]; total: number }> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return { orders, total };
  }

  async findAll(params: {
    page: number;
    limit: number;
    status?: string;
  }): Promise<{ orders: OrderWithItemsAndUser[]; total: number }> {
    const { page, limit, status } = params;
    const where: Prisma.OrderWhereInput = status ? { status } : {};
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  async updateStatus(id: string, status: string): Promise<OrderWithItemsAndUser> {
    return prisma.order.update({
      where: { id },
      data: { status },
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
  }

  async getMetrics(): Promise<{
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
  }> {
    const [totalOrders, pendingOrders, revenueAggregate] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          status: { not: 'CANCELLED' },
        },
      }),
    ]);

    return {
      totalRevenue: Number((revenueAggregate._sum.totalAmount || 0).toFixed(2)),
      totalOrders,
      pendingOrders,
    };
  }

  async getRecentOrders(limit = 5): Promise<OrderWithItemsAndUser[]> {
    return prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
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
  }
}

export const orderRepository = new OrderRepository();
