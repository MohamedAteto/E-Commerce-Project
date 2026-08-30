import { prisma } from '../config/database.js';
import { Cart, CartItem, Product, ProductImage, Prisma } from '@prisma/client';

export type CartItemWithProduct = CartItem & {
  product: Product & {
    images: ProductImage[];
  };
};

export type CartWithItems = Cart & {
  items: CartItemWithProduct[];
};

export class CartRepository {
  async findByUserId(userId: string): Promise<CartWithItems | null> {
    return prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { displayOrder: 'asc' },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async createForUser(userId: string): Promise<CartWithItems> {
    return prisma.cart.create({
      data: {
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { displayOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    });
  }

  async findItem(cartId: string, productId: string): Promise<CartItem | null> {
    return prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
    });
  }

  async findItemById(itemId: string): Promise<CartItem | null> {
    return prisma.cartItem.findUnique({
      where: { id: itemId },
    });
  }

  async upsertItem(cartId: string, productId: string, quantity: number): Promise<CartItem> {
    return prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        cartId,
        productId,
        quantity,
      },
    });
  }

  async updateItemQuantity(itemId: string, quantity: number): Promise<CartItem> {
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async removeItem(itemId: string): Promise<CartItem> {
    return prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async clearCart(cartId: string): Promise<Prisma.BatchPayload> {
    return prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }
}

export const cartRepository = new CartRepository();
