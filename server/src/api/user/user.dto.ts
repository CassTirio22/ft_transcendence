import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateNameDto {
  @IsString()
  @IsNotEmpty()
  public readonly name?: string;
}