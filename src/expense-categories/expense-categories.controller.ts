import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { ExpenseCategoriesService } from './expense-categories.service';

@Controller('expense-categories')
export class ExpenseCategoriesController {
  constructor(private readonly service: ExpenseCategoriesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateCategoryDto) {
    return this.service.updateCategory(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteCategory(id);
  }

  @Post(':id/subcategories')
  createSubcategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateSubcategoryDto,
  ) {
    return this.service.createSubcategory(id, dto);
  }

  @Put('subcategories/:id')
  updateSubcategory(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateSubcategoryDto) {
    return this.service.updateSubcategory(id, dto);
  }

  @Delete('subcategories/:id')
  @HttpCode(204)
  removeSubcategory(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteSubcategory(id);
  }
}
