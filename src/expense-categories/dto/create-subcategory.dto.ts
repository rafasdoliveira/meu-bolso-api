import { IsString } from 'class-validator';

export class CreateSubcategoryDto {
  @IsString({ message: 'O campo Nome é obrigatório' })
  name: string;
}
