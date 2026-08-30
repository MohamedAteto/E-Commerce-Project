import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/database.js';

describe('Cart Management & Business Logic', () => {
  const app = createApp();

  let customerToken: string;
  let customerId: string;
  let testProduct: any;

  beforeAll(async () => {
    const custRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@store.com', password: 'CustomerPass123!' });
    customerToken = custRes.body.data.token;
    customerId = custRes.body.data.user.id;

    testProduct = await prisma.product.findFirstOrThrow({ where: { slug: 'aeropulse-pro-headphones' } });
  });

  beforeEach(async () => {
    // Clear customer cart before each test
    const cart = await prisma.cart.findUnique({ where: { userId: customerId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  });

  it('GET /api/cart returns empty cart when no items added', async () => {
    const response = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.cart.items).toEqual([]);
    expect(response.body.data.cart.subtotal).toBe(0);
    expect(response.body.data.cart.total).toBe(0);
    expect(response.body.data.cart.itemCount).toBe(0);
  });

  it('POST /api/cart/items adds an item and recalculates subtotal, tax, and shipping', async () => {
    const response = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: testProduct.id,
        quantity: 2,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.cart.items.length).toBe(1);
    expect(response.body.data.cart.items[0].quantity).toBe(2);
    expect(response.body.data.cart.itemCount).toBe(2);

    const expectedSubtotal = Number((testProduct.price * 2).toFixed(2));
    expect(response.body.data.cart.subtotal).toBe(expectedSubtotal);
    expect(response.body.data.cart.tax).toBe(Number((expectedSubtotal * 0.08).toFixed(2)));
  });

  it('POST /api/cart/items rejects quantity exceeding available stock', async () => {
    const response = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: testProduct.id,
        quantity: testProduct.stock + 10,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INSUFFICIENT_STOCK');
  });

  it('PATCH /api/cart/items/:itemId updates item quantity', async () => {
    // Add item first
    const addRes = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: testProduct.id,
        quantity: 1,
      });

    const itemId = addRes.body.data.cart.items[0].id;

    // Update to 3
    const updateRes = await request(app)
      .patch(`/api/cart/items/${itemId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 3 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.cart.items[0].quantity).toBe(3);
    expect(updateRes.body.data.cart.itemCount).toBe(3);
  });

  it('DELETE /api/cart/items/:itemId removes the item', async () => {
    const addRes = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: testProduct.id,
        quantity: 1,
      });

    const itemId = addRes.body.data.cart.items[0].id;

    const delRes = await request(app)
      .delete(`/api/cart/items/${itemId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.data.cart.items.length).toBe(0);
    expect(delRes.body.data.cart.subtotal).toBe(0);
  });
});
