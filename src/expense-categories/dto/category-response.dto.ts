export class SubcategoryResponseDto {
  id: number;
  name: string;
}

export class CategoryResponseDto {
  id: number;
  name: string;
  subcategories: SubcategoryResponseDto[];
}
