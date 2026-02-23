import { Controller, Get, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categorias')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Query('parent') parent?: string) {
    return this.categoriesService.findAll(
      parent !== undefined ? parseInt(parent, 10) : undefined,
    );
  }
}
