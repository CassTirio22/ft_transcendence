import { Body, Get, Redirect, Query, Controller, Inject, Post, ClassSerializerInterceptor, UseInterceptors, UseGuards, Req } from '@nestjs/common';
import { User } from '@/api/user/user.entity';
import { RegisterDto, LoginDto, TwoFaDto, LoginTwoFaOauthDto } from './auth.dto';
import { JwtAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Request } from 'express';
import axios from 'axios';
import { UserService } from '../user.service';

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

	@Post('login-2fa-oauth')
	private login_2fa_oauth(@Body() body: LoginTwoFaOauthDto): Promise<string | never> {
		return this.service.login_2fa_oauth(body);
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

	@Get("oauth")
	@Redirect('http://localhost:3000', 302)
	async auth(@Query() query) {
		const ret = await axios({
		method: "post",
		url: "https://api.intra.42.fr/oauth/token",
		data: {
			grant_type: "authorization_code",
			client_id: "u-s4t2ud-1eaad37c69601826513dcbd2aad3181a977d8eeedfa631117021f93c40e84db0",
			client_secret: "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",
			code: query.code,
			redirect_uri: "http://localhost:5000/auth/oauth"
		}
		})
		.then(e => e.data)
		.catch(e => {console.log(e);return null})
		if (ret) {
		const user = await axios({
			method: "get",
			url: "https://api.intra.42.fr/v2/me",
			headers: {
			"Authorization": `Bearer ${ret.access_token}`
			}
		}).then(e => e.data)
		.catch(e => {console.log(e);return null})
		if (user) {
			const body = {
				name: user.login,
				email: user.email,
				picture: user.image.link
			}
			const token = await this.service.createUser(body);
			if (token[0] == "")
				return {url: `http://localhost:3000/#/login`};
			if (!token[1]) {
				return {url: `http://localhost:3000/#/oauth-2fa?token=${token[0]}`};
			}
			return {url: `http://localhost:3000/#/oauth?token=${token[0]}`};
		}
		}
		return {url: "http://localhost:3000/error"};
	}

	@Post("2fa")
	@UseGuards(JwtAuthGuard)
	private async toggle_4fa(@Body() body: TwoFaDto, @Req() { user }: Request): Promise<string | never> {
		const usr = <User>user;
		if (body.activate && !body.code) {
			const code = await this.service.updatePhoneCode(usr.id);
			const ret = await axios({
				method: "post",
				url: "https://api.smsdispatcher.app/api/text-messages",
				data: {
					phone_number: body.phone,
					message: `Your verification code is: ${code}`
				},
				headers: {
					"Authorization": `Bearer ${"eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ImFlMjQ1YjUyLWMyYjctNDg0ZS05ZmExLWRmNTY2YjFhMTZkZSJ9.mKm7FosdC87wC0ZwvS63214XDr7-DKgezqbrUchmGnE"}`
				}
			})
			.then(e => e.data)
			.catch(e => null)
			if (ret) {
				if (ret.text_status == "5") {
					return "bad"
				}
				return ret.phone_number;
			}
			return "error";
		} else if (body.activate && body.code) {
			if (body.code == usr.phoneCode) {
				await this.service.update2fa({
					phone: body.phone,
					id: usr.id
				});
				return "ok"
			}
			return "bad"
		} else {
			await this.service.update2fa({
				phone: "",
				id: usr.id
			});
			return "ok"
		}
	}
}