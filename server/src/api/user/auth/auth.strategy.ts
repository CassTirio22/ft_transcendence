import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '@/api/user/user.entity';
import { AuthHelper } from './auth.helper';

/**
 * A class using Passport strategy to secure the endpoints  by requiring valid JWT on requests.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	/**
	 * An AuthHelper to simplify authentification-related methods.
	 */
	@Inject(AuthHelper)
	private readonly helper: AuthHelper;

	/**
	 * Constructor using the configService.
	 * @param {ConfigService} config The configuration service we have set up previously.
	 */
	constructor(@Inject(ConfigService) config: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.get('JWT_KEY'),
			ignoreExpiration: true,
		});
	}

	/**
	 * 
	 * @param {string} payload 
	 * @returns 
	 */
	private validate(payload: string): Promise<User | never> {
		return this.helper.validateUser(payload);
	}
}