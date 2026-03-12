import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { ExpenseCategory } from './entities/expense-category.entity';
import { ExpenseSubcategory } from './entities/expense-subcategory.entity';

@Injectable()
export class ExpenseCategoriesService {
  constructor(
    @InjectRepository(ExpenseCategory)
    private readonly categoryRepository: Repository<ExpenseCategory>,
    @InjectRepository(ExpenseSubcategory)
    private readonly subcategoryRepository: Repository<ExpenseSubcategory>,
  ) {}

  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.find({
      order: { name: 'ASC' },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      subcategories: cat.subcategories
        .map((sub) => ({ id: sub.id, name: sub.name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const category = this.categoryRepository.create({ name: dto.name });
    const saved = await this.categoryRepository.save(category);
    return { id: saved.id, name: saved.name, subcategories: [] };
  }

  async updateCategory(id: number, dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Categoria #${id} não encontrada`);

    category.name = dto.name;
    const saved = await this.categoryRepository.save(category);
    return { id: saved.id, name: saved.name, subcategories: [] };
  }

  async deleteCategory(id: number): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Categoria #${id} não encontrada`);
    await this.categoryRepository.remove(category);
  }

  async createSubcategory(categoryId: number, dto: CreateSubcategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!category) throw new NotFoundException(`Categoria #${categoryId} não encontrada`);

    const subcategory = this.subcategoryRepository.create({ name: dto.name, category });
    const saved = await this.subcategoryRepository.save(subcategory);
    return { id: saved.id, name: saved.name, category_id: categoryId };
  }

  async updateSubcategory(id: number, dto: CreateSubcategoryDto) {
    const subcategory = await this.subcategoryRepository.findOne({ where: { id } });
    if (!subcategory) throw new NotFoundException(`Subcategoria #${id} não encontrada`);

    subcategory.name = dto.name;
    const saved = await this.subcategoryRepository.save(subcategory);
    return { id: saved.id, name: saved.name };
  }

  async deleteSubcategory(id: number): Promise<void> {
    const subcategory = await this.subcategoryRepository.findOne({ where: { id } });
    if (!subcategory) throw new NotFoundException(`Subcategoria #${id} não encontrada`);
    await this.subcategoryRepository.remove(subcategory);
  }
}
