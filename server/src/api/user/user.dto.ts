import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetProfileDto {
	@IsNumber()
	@IsNotEmpty()
	public readonly id: number;
}

export class UpdateNameDto {
  @IsString()
  @IsNotEmpty()
  public readonly name?: string;
}