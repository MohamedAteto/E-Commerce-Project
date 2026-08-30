import { prisma } from '../config/database.js';
import { Product, ProductImage, Category, Prisma } from '@prisma/client';
import { ProductQueryInput } from '../validators/product.validator.js';

export type ProductWithRelations = Product & {
  category: Category;
  images: ProductImage[];
};

export class ProductRepository {
  async findMany(query: ProductQueryInput): Promise<{ products: ProductWithRelations[]; total: number }> {
    const { page, limit, search, categoryId, minPrice, maxPrice, sort, isActive } = query;

    const where: Prisma.ProductWhereInput = {};

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'name_asc') orderBy = { name: 'asc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: {
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async findByIdOrSlug(idOrSlug: string): Promise<ProductWithRelations | null> {
    return prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        category: true,
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { slug },
    });
  }

  async create(
    productData: Prisma.ProductCreateWithoutImagesInput & {
      category: Prisma.CategoryCreateNestedOneWithoutProductsInput;
      images?: { url: string; isPrimary?: boolean; displayOrder?: number }[];
    }
  ): Promise<ProductWithRelations> {
    const { images, ...data } = productData;

    return prisma.product.create({
      data: {
        ...data,
        images: images && images.length > 0 ? { create: images } : undefined,
      },
      include: {
        category: true,
        images: true,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.ProductUpdateInput,
    images?: { url: string; isPrimary?: boolean; displayOrder?: number }[]
  ): Promise<ProductWithRelations> {
    if (images !== undefined) {
      // Replace images transactionally
      return prisma.$transaction(async (tx) => {
        await tx.productImage.deleteMany({ where: { productId: id } });
        return tx.product.update({
          where: { id },
          data: {
            ...data,
            images: {
              create: images,
            },
          },
          include: {
            category: true,
            images: true,
          },
        });
      });
    }

    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        images: true,
      },
    });
  }

  async delete(id: string): Promise<Product> {
    return prisma.product.delete({
      where: { id },
    });
  }

  async countLowStock(threshold = 5): Promise<number> {
    return prisma.product.count({
      where: {
        stock: { lte: threshold },
        isActive: true,
      },
    });
  }
}

export const productRepository = new ProductRepository();
