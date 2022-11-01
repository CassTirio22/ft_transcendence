import { Trim } from 'class-sanitizer';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object for User registration.
 * Documentation about DTOs : https://docs.nestjs.com/controllers
 */
export class RegisterDto {
	@Trim()
	@IsEmail()
	public readonly email: string;

	@IsString()
	@MinLength(8)
	public readonly password: string;

	@IsString()
	@IsOptional()
	public readonly name?: string;
}

/**
 * Data Transfer Object for User login.
 * Documentation about DTOs : https://docs.nestjs.com/controllers
 */
export class LoginDto {
	@Trim()
	@IsEmail()
	public readonly email: string;

	@IsString()
	public readonly password: string;
}