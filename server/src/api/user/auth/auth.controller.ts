import { Body, Controller, Inject, Post, ClassSerializerInterceptor, UseInterceptors, UseGuards, Req } from '@nestjs/common';
import { User } from '@/api/user/user.entity';
import { RegisterDto, LoginDto } from './auth.dto';
import { JwtAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Request } from 'express';

/**
 * A Controller class for authentification.
 * Documentation about controllers : https://docs.nestjs.com/controllers
 */
@Controller('auth')
export class AuthController {
	/**
	 * Endpoint management using the AuthService class.
	 */
	@Inject(AuthService)
	private readonly service: AuthService;

	/**
	 * Manage a User registration Post request.
	 * @param {RegisterDto} body The registration infos in the form of RegisterDto.
	 * @returns The created User if registration is successful and exception else.
	 */
	@Post('register')
	@UseInterceptors(ClassSerializerInterceptor)
	private register(@Body() body: RegisterDto): Promise<User | never> {
		return this.service.register(body);
	}

	/**
	 * Manage a User login Post request.
	 * @param {LoginDto} body The login infos in the form of LoginDto.
	 * @returns A User if login is successful or exception else.
	 */
	@Post('login')
	private login(@Body() body: LoginDto): Promise<string | never> {
		return this.service.login(body);
	}

	/**
	 * Refresh the JWT Token for User after getting it from request object.
	 * @param param The User params from the request object.
	 * @returns The JWT Token if success and exception else.
	 */
	@Post('refresh')
	@UseGuards(JwtAuthGuard)
	private refresh(@Req() { user }: Request): Promise<string | never> {
		return this.service.refresh(<User>user);
	}
}