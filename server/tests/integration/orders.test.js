import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/database.js';
describe('Orders, Atomic Checkout & Admin Management', () => {
    const app = createApp();
    let adminToken;
    let customerToken;
    let customerId;
    let testProduct;
    let placedOrderId;
    const validShippingAddress = {
        street: '123 Tech Lane',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94107',
        country: 'United States',
        phone: '+1-555-0199',
    };
    beforeAll(async () => {
        // Admin login
        const adminRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@store.com', password: 'AdminPass123!' });
        adminToken = adminRes.body.data.token;
        // Customer login
        const custRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'customer@store.com', password: 'CustomerPass123!' });
        customerToken = custRes.body.data.token;
        customerId = custRes.body.data.user.id;
        testProduct = await prisma.product.findFirstOrThrow({ where: { slug: 'aeropulse-pro-headphones' } });
    });
    it('POST /api/orders rejects checkout when cart is empty', async () => {
        // Ensure cart is empty
        const cart = await prisma.cart.findUnique({ where: { userId: customerId } });
        if (cart) {
            await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
        const response = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ shippingAddress: validShippingAddress });
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('EMPTY_CART');
    });
    it('POST /api/orders processes atomic checkout: creates order, decrements stock, clears cart', async () => {
        const initialStock = testProduct.stock;
        // 1. Add 2 units to cart
        await request(app)
            .post('/api/cart/items')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
            productId: testProduct.id,
            quantity: 2,
        });
        // 2. Perform checkout
        const checkoutRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ shippingAddress: validShippingAddress });
        expect(checkoutRes.status).toBe(201);
        expect(checkoutRes.body.success).toBe(true);
        const order = checkoutRes.body.data.order;
        placedOrderId = order.id;
        expect(order.status).toBe('PENDING');
        expect(order.items.length).toBe(1);
        expect(order.items[0].productNameSnapshot).toBe(testProduct.name);
        expect(order.items[0].quantity).toBe(2);
        // 3. Verify stock was decremented in database
        const updatedProduct = await prisma.product.findUniqueOrThrow({ where: { id: testProduct.id } });
        expect(updatedProduct.stock).toBe(initialStock - 2);
        // 4. Verify customer cart was emptied
        const cartRes = await request(app)
            .get('/api/cart')
            .set('Authorization', `Bearer ${customerToken}`);
        expect(cartRes.body.data.cart.items.length).toBe(0);
    });
    it('GET /api/orders returns customer order history', async () => {
        const response = await request(app)
            .get('/api/orders')
            .set('Authorization', `Bearer ${customerToken}`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.orders.length).toBeGreaterThan(0);
    });
    it('GET /api/orders/:id retrieves order receipt with items', async () => {
        const response = await request(app)
            .get(`/api/orders/${placedOrderId}`)
            .set('Authorization', `Bearer ${customerToken}`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.order.id).toBe(placedOrderId);
        expect(response.body.data.order.items.length).toBeGreaterThan(0);
    });
    it('GET /api/admin/orders lists all orders for admin', async () => {
        const response = await request(app)
            .get('/api/admin/orders')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.orders.length).toBeGreaterThan(0);
    });
    it('PATCH /api/admin/orders/:id/status updates order status', async () => {
        const response = await request(app)
            .patch(`/api/admin/orders/${placedOrderId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'PROCESSING' });
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.order.status).toBe('PROCESSING');
    });
    it('PATCH /api/admin/orders/:id/status CANCELLED restores product stock', async () => {
        const beforeProduct = await prisma.product.findUniqueOrThrow({ where: { id: testProduct.id } });
        const response = await request(app)
            .patch(`/api/admin/orders/${placedOrderId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'CANCELLED' });
        expect(response.status).toBe(200);
        expect(response.body.data.order.status).toBe('CANCELLED');
        // Verify stock restoration
        const restoredProduct = await prisma.product.findUniqueOrThrow({ where: { id: testProduct.id } });
        expect(restoredProduct.stock).toBe(beforeProduct.stock + 2);
    });
    it('GET /api/admin/stats returns aggregate dashboard analytics', async () => {
        const response = await request(app)
            .get('/api/admin/stats')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.stats).toHaveProperty('totalRevenue');
        expect(response.body.data.stats).toHaveProperty('totalOrders');
        expect(response.body.data.stats).toHaveProperty('totalCustomers');
        expect(response.body.data.stats).toHaveProperty('lowStockCount');
        expect(response.body.data.stats).toHaveProperty('recentOrders');
    });
});
