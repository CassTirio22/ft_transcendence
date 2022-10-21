import { Injectable, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { NoVersionOrUpdateDateColumnError, Repository } from 'typeorm';
import { User } from '@/api/user/user.entity';
import * as bcrypt from 'bcryptjs';
import { ARRAY_MAX_SIZE } from 'class-validator';

/**
 * Contains many methods to help with user's authentification.
 */
@Injectable()
export class AuthHelper {
	/**
	 * A Repository based on the User.
	 */
	@InjectRepository(User)
	private readonly repository: Repository<User>;

	/**
	 * The JwtService is needed for many methods decoding, signing, verifying, ... JSON Web Tokens.
	 */
	private readonly jwt: JwtService;

	/**
	 * A constructor if wanting to use a custom JwtService.
	 * @param {JwtService} jwt The JwtService you want to use with this class methods.
	 */
	constructor(jwt: JwtService) {
		this.jwt = jwt;
	}

	/**
	 * Decoding the JWT Token.
	 * @param {string} token The encoded JWT.
	 * @returns {any} The decoded JWT.
	 */
	public async decode(token: string): Promise<unknown> {
		return this.jwt.decode(token, null);
	}

	/**
	 * Get User by User ID we get from decode().
	 * @param {any} decoded The decoded JWT.
	 * @returns {User} The user with the corresponding id found in the JWT. null if there is none.
	 */
	public async validateUser(decoded: any): Promise<User> {
		return this.repository.findOne(decoded.id);
	}

	/**
	 * Generate a JWT Token.
	 * @param {User} user The User that will be used to create a corresponding JWT token. 
	 * @returns {string} The generated JWT token.
	 */
	public generateToken(user: User): string {
		return this.jwt.sign({ id: user.id, email: user.email });
	}

	/**
	 * Validate User's password if correct.
	 * @param {string} password The non-hashed password.
	 * @param {string} userPassword The already hashed password.
	 * @returns {boolean} True if the passwords are the same and false else.
	 */
	public isPasswordValid(password: string, userPassword: string): boolean {
		return bcrypt.compareSync(password, userPassword);
	}

	/**
	 * Encode User's password by hashing it.
	 * @param {string} password The entered password.
	 * @returns {string} The hashed password.
	 */
	public encodePassword(password: string): string {
		const salt: string = bcrypt.genSaltSync(10);

		return bcrypt.hashSync(password, salt);
	}

	/**
	 * Validate JWT Token, throw forbidden error if JWT Token is invalid.
	 * @param {string} token The JWT Token.
	 * @returns True if JWT is validated. Else an error is thrown.
	 */
	private async validate(token: string): Promise<boolean | never> {
		const decoded: unknown = this.jwt.verify(token);

		if (!decoded) {
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		}

		const user: User = await this.validateUser(decoded);

		if (!user) {
			throw new UnauthorizedException();
		}

		return true;
	}
}