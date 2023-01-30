import { read } from 'fs';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class EditUserDto {
  @IsString()
  @IsOptional()
  public readonly name: string;

  @IsString()
  @IsOptional()
  public readonly password: string;

  @IsString()
  @IsOptional()
  public readonly email: string;

  @IsString()
  @IsOptional()
  public readonly picture: string;
}

export class CustomizeUserDto {
	@IsNumber()
	public readonly coins: number;

	@IsNotEmpty()
	public readonly custom: any;
}