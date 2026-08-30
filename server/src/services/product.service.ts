import { productRepository, ProductRepository, ProductWithRelations } from '../repositories/product.repository.js';
import { categoryRepository, CategoryRepository } from '../repositories/category.repository.js';
import { ProductQueryInput, CreateProductInput, UpdateProductInput } from '../validators/product.validator.js';
import { AppError, PaginationMeta } from '../types/api.js';

export class ProductService {
  constructor(
    private productRepo: ProductRepository = productRepository,
    private categoryRepo: CategoryRepository = categoryRepository
  ) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-');
  }

  async getProducts(query: ProductQueryInput): Promise<{ products: ProductWithRelations[]; meta: PaginationMeta }> {
    const { products, total } = await this.productRepo.findMany(query);
    const { page, limit } = query;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      products,
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

  async getProductByIdOrSlug(idOrSlug: string, requireActive = true): Promise<ProductWithRelations> {
    const product = await this.productRepo.findByIdOrSlug(idOrSlug);
    if (!product || (requireActive && !product.isActive)) {
      throw new AppError('Product not found or currently unavailable', 404, 'PRODUCT_NOT_FOUND');
    }
    return product;
  }

  async createProduct(input: CreateProductInput): Promise<ProductWithRelations> {
    const category = await this.categoryRepo.findById(input.categoryId);
    if (!category) {
      throw new AppError('Specified category does not exist', 400, 'CATEGORY_NOT_FOUND');
    }

    const slug = input.slug || this.slugify(input.name);
    const existingSlug = await this.productRepo.findBySlug(slug);
    if (existingSlug) {
      throw new AppError('A product with this URL slug already exists', 409, 'PRODUCT_SLUG_EXISTS');
    }

    return this.productRepo.create({
      name: input.name,
      slug,
      description: input.description,
      price: input.price,
      stock: input.stock,
      isActive: input.isActive ?? true,
      category: { connect: { id: input.categoryId } },
      images: input.images,
    });
  }

  async updateProduct(id: string, input: UpdateProductInput): Promise<ProductWithRelations> {
    await this.getProductByIdOrSlug(id, false);

    if (input.categoryId) {
      const category = await this.categoryRepo.findById(input.categoryId);
      if (!category) {
        throw new AppError('Specified category does not exist', 400, 'CATEGORY_NOT_FOUND');
      }
    }

    if (input.slug) {
      const existingSlug = await this.productRepo.findBySlug(input.slug);
      if (existingSlug && existingSlug.id !== id) {
        throw new AppError('A product with this URL slug already exists', 409, 'PRODUCT_SLUG_EXISTS');
      }
    }

    const { images, categoryId, ...data } = input;

    return this.productRepo.update(
      id,
      {
        ...data,
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
      },
      images
    );
  }

  async deleteProduct(id: string): Promise<void> {
    await this.getProductByIdOrSlug(id, false);
    await this.productRepo.delete(id);
  }
}

export const productService = new ProductService();
