import { Trim } from 'class-sanitizer';
import { IsBoolean, IsEmail, IsOptional, IsString, IsUrl, MinLength, IsNumber } from 'class-validator';
import { Url } from 'url';

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
	public readonly name: string;

	@IsBoolean()
	@IsOptional()
	public readonly intraAuth: boolean;
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

	@IsString()
	@IsOptional()
	public readonly code: string;
}

export class LoginTwoFaOauthDto {

	@IsString()
	public readonly token: string;

	@IsString()
	public readonly code: string;
}

export class IntraRegisterDto {
	@Trim()
	@IsEmail()
	public readonly email: string;

	@IsString()
	public readonly name: string;

	@IsString()
	public readonly picture: string;

}

export class TwoFaDto {
	@IsBoolean()
	public readonly activate: boolean;
	
	@IsString()
	@IsOptional()
	public readonly phone: string;

	@IsString()
	@IsOptional()
	public readonly code: string;
}

export class PhoneNumberId {
	@IsNumber()
	public readonly id: number;
	
	@IsString()
	public readonly phone: string;
}