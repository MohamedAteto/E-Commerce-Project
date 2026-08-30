import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/database.js';
describe('Product Catalog & Category API', () => {
    const app = createApp();
    let adminToken;
    let customerToken;
    let sampleCategory;
    beforeAll(async () => {
        // Obtain admin token
        const adminRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@store.com', password: 'AdminPass123!' });
        adminToken = adminRes.body.data.token;
        // Obtain customer token
        const custRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'customer@store.com', password: 'CustomerPass123!' });
        customerToken = custRes.body.data.token;
        sampleCategory = await prisma.category.findFirstOrThrow();
    });
    beforeEach(async () => {
        // Clean up created test items
        await prisma.productImage.deleteMany({
            where: { product: { slug: 'quantum-soundbar-51' } },
        });
        await prisma.product.deleteMany({
            where: { slug: 'quantum-soundbar-51' },
        });
        await prisma.category.deleteMany({
            where: { slug: 'drones-robotics' },
        });
    });
    it('GET /api/categories returns list of all categories with product counts', async () => {
        const response = await request(app).get('/api/categories');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data.categories)).toBe(true);
        expect(response.body.data.categories.length).toBeGreaterThan(0);
        expect(response.body.data.categories[0]).toHaveProperty('_count');
    });
    it('POST /api/categories allows admin to create new category', async () => {
        const response = await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            name: 'Drones & Robotics',
            description: 'Autonomous camera drones and high-tech robotic toys',
        });
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.category.name).toBe('Drones & Robotics');
        expect(response.body.data.category.slug).toBe('drones-robotics');
    });
    it('POST /api/categories rejects non-admin users with 403', async () => {
        const response = await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
            name: 'Hacker Category',
        });
        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('FORBIDDEN_ADMIN_ACCESS');
    });
    it('GET /api/products returns paginated product list with meta', async () => {
        const response = await request(app)
            .get('/api/products')
            .query({ page: 1, limit: 4 });
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.products.length).toBeLessThanOrEqual(4);
        expect(response.body.meta).toHaveProperty('page', 1);
        expect(response.body.meta).toHaveProperty('limit', 4);
        expect(response.body.meta).toHaveProperty('total');
        expect(response.body.meta).toHaveProperty('totalPages');
    });
    it('GET /api/products filters by search term', async () => {
        const response = await request(app)
            .get('/api/products')
            .query({ search: 'Headphones' });
        expect(response.status).toBe(200);
        expect(response.body.data.products.length).toBeGreaterThan(0);
        expect(response.body.data.products[0].name).toContain('Headphones');
    });
    it('GET /api/products/:idOrSlug retrieves product with relations', async () => {
        const response = await request(app).get('/api/products/aeropulse-pro-headphones');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.product.slug).toBe('aeropulse-pro-headphones');
        expect(response.body.data.product).toHaveProperty('category');
        expect(Array.isArray(response.body.data.product.images)).toBe(true);
    });
    it('POST /api/products allows admin to create product with images', async () => {
        const newProductData = {
            name: 'Quantum Soundbar 51',
            description: 'Cinema-grade Dolby Atmos soundbar with wireless subwoofer and rear satellites.',
            price: 499.99,
            stock: 15,
            categoryId: sampleCategory.id,
            images: [
                { url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800', isPrimary: true, displayOrder: 0 },
            ],
        };
        const response = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(newProductData);
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.product.name).toBe(newProductData.name);
        expect(response.body.data.product.price).toBe(499.99);
        expect(response.body.data.product.images.length).toBe(1);
    });
    it('PUT /api/products/:id allows admin to update price and stock', async () => {
        const prod = await prisma.product.findFirstOrThrow({ where: { slug: 'aeropulse-pro-headphones' } });
        const response = await request(app)
            .put(`/api/products/${prod.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            price: 279.99,
            stock: 45,
        });
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.product.price).toBe(279.99);
        expect(response.body.data.product.stock).toBe(45);
    });
});
