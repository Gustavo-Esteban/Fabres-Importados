import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('produtos')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query('categoria') categoria?: string,
    @Query('page') page = '1',
    @Query('per_page') perPage = '12',
    @Query('orderby') orderby = 'date',
    @Query('busca') busca?: string,
  ) {
    return this.productsService.findAll({
      categoria,
      page: parseInt(page, 10),
      perPage: parseInt(perPage, 10),
      orderby,
      busca,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }
}
