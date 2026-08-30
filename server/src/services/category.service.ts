import { categoryRepository, CategoryRepository } from '../repositories/category.repository.js';
import { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator.js';
import { AppError } from '../types/api.js';
import { Category } from '@prisma/client';

export class CategoryService {
  constructor(private categoryRepo: CategoryRepository = categoryRepository) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-');
  }

  async getAllCategories(): Promise<(Category & { _count: { products: number } })[]> {
    return this.categoryRepo.findAll();
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }
    return category;
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const existingName = await this.categoryRepo.findByName(input.name);
    if (existingName) {
      throw new AppError('A category with this name already exists', 409, 'CATEGORY_NAME_EXISTS');
    }

    const slug = input.slug || this.slugify(input.name);
    const existingSlug = await this.categoryRepo.findBySlug(slug);
    if (existingSlug) {
      throw new AppError('A category with this slug already exists', 409, 'CATEGORY_SLUG_EXISTS');
    }

    return this.categoryRepo.create({
      name: input.name,
      slug,
      description: input.description,
    });
  }

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    await this.getCategoryById(id);

    if (input.name) {
      const existingName = await this.categoryRepo.findByName(input.name);
      if (existingName && existingName.id !== id) {
        throw new AppError('A category with this name already exists', 409, 'CATEGORY_NAME_EXISTS');
      }
    }

    if (input.slug) {
      const existingSlug = await this.categoryRepo.findBySlug(input.slug);
      if (existingSlug && existingSlug.id !== id) {
        throw new AppError('A category with this slug already exists', 409, 'CATEGORY_SLUG_EXISTS');
      }
    }

    return this.categoryRepo.update(id, input);
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.getCategoryById(id);
    const withCount = category as any;
    if (withCount._count && withCount._count.products > 0) {
      throw new AppError(
        'Cannot delete category with associated products. Reassign or delete products first.',
        400,
        'CATEGORY_HAS_PRODUCTS'
      );
    }
    await this.categoryRepo.delete(id);
  }
}

export const categoryService = new CategoryService();
