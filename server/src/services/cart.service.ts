import { cartRepository, CartRepository, CartWithItems } from '../repositories/cart.repository.js';
import { productRepository, ProductRepository } from '../repositories/product.repository.js';
import { AddCartItemInput, UpdateCartItemInput } from '../validators/cart.validator.js';
import { AppError } from '../types/api.js';

export interface CartCalculationResult {
  id: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productSlug: string;
    productPrice: number;
    primaryImageUrl: string | null;
    quantity: number;
    lineTotal: number;
    stock: number;
    isAvailable: boolean;
    hasStockIssue: boolean;
  }>;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  itemCount: number;
}

export class CartService {
  constructor(
    private cartRepo: CartRepository = cartRepository,
    private productRepo: ProductRepository = productRepository
  ) {}

  private async getOrCreateCart(userId: string): Promise<CartWithItems> {
    let cart = await this.cartRepo.findByUserId(userId);
    if (!cart) {
      cart = await this.cartRepo.createForUser(userId);
    }
    return cart;
  }

  private calculateCartTotals(cart: CartWithItems): CartCalculationResult {
    let subtotal = 0;
    let itemCount = 0;

    const formattedItems = cart.items.map((item) => {
      const isAvailable = item.product.isActive && item.product.stock > 0;
      const hasStockIssue = item.quantity > item.product.stock;
      const lineTotal = isAvailable ? Number((item.quantity * item.product.price).toFixed(2)) : 0;

      if (isAvailable && !hasStockIssue) {
        subtotal += lineTotal;
        itemCount += item.quantity;
      }

      const primaryImg = item.product.images.find((img) => img.isPrimary) || item.product.images[0] || null;

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productSlug: item.product.slug,
        productPrice: item.product.price,
        primaryImageUrl: primaryImg ? primaryImg.url : null,
        quantity: item.quantity,
        lineTotal,
        stock: item.product.stock,
        isAvailable,
        hasStockIssue,
      };
    });

    subtotal = Number(subtotal.toFixed(2));
    const tax = Number((subtotal * 0.08).toFixed(2)); // Standard 8% tax
    const shippingCost = subtotal > 150 || subtotal === 0 ? 0 : 15.0; // Free shipping over $150
    const total = Number((subtotal + tax + shippingCost).toFixed(2));

    return {
      id: cart.id,
      items: formattedItems,
      subtotal,
      tax,
      shippingCost,
      total,
      itemCount,
    };
  }

  async getCart(userId: string): Promise<CartCalculationResult> {
    const cart = await this.getOrCreateCart(userId);
    return this.calculateCartTotals(cart);
  }

  async addItem(userId: string, input: AddCartItemInput): Promise<CartCalculationResult> {
    const product = await this.productRepo.findByIdOrSlug(input.productId);
    if (!product || !product.isActive) {
      throw new AppError('Product is currently unavailable', 400, 'PRODUCT_UNAVAILABLE');
    }

    const cart = await this.getOrCreateCart(userId);
    const existingItem = await this.cartRepo.findItem(cart.id, input.productId);
    const currentQty = existingItem ? existingItem.quantity : 0;
    const requestedTotalQty = currentQty + input.quantity;

    if (requestedTotalQty > product.stock) {
      throw new AppError(
        `Cannot add ${input.quantity} unit(s). Only ${product.stock} available in stock (${currentQty} already in cart).`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }

    await this.cartRepo.upsertItem(cart.id, input.productId, input.quantity);
    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, input: UpdateCartItemInput): Promise<CartCalculationResult> {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.cartRepo.findItemById(itemId);

    if (!item || item.cartId !== cart.id) {
      throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
    }

    const product = await this.productRepo.findByIdOrSlug(item.productId);
    if (!product || !product.isActive) {
      throw new AppError('Product is currently unavailable', 400, 'PRODUCT_UNAVAILABLE');
    }

    if (input.quantity > product.stock) {
      throw new AppError(
        `Cannot update quantity to ${input.quantity}. Only ${product.stock} available in stock.`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }

    await this.cartRepo.updateItemQuantity(itemId, input.quantity);
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string): Promise<CartCalculationResult> {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.cartRepo.findItemById(itemId);

    if (!item || item.cartId !== cart.id) {
      throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
    }

    await this.cartRepo.removeItem(itemId);
    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<CartCalculationResult> {
    const cart = await this.getOrCreateCart(userId);
    await this.cartRepo.clearCart(cart.id);
    return this.getCart(userId);
  }
}

export const cartService = new CartService();
