import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Informe o nome da categoria.' })
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  name: string;
}
