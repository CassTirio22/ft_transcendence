import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/api/user/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto, LoginDto } from './auth.dto';
import { AuthHelper } from './auth.helper';

/**
 * This class will manage the logic behind our endpoints.
 * Documentation about endpoints : https://docs.nestjs.com/controllers
 */
@Injectable()
export class AuthService {
	/**
	 * A Repository based on the User.
	 */
	@InjectRepository(User)
	private readonly repository: Repository<User>;

	/**
	 * An AuthHelper to simplify authentification-related methods.
	 */
	@Inject(AuthHelper)
	private readonly helper: AuthHelper;

	/**
	 * Create a new User getting important informations from RegisterDto class.
	 * @param {RegisterDto} body A class containing name, email and password.
	 * @returns Returns a the new user or an exception.
	 */
	public async register(body: RegisterDto): Promise<User | never> {
		const { name, email, password }: RegisterDto = body;
		let user: User = await this.repository.findOne({ where: { email } });

		if (user) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}

		user = new User();

		user.name = name;
		user.email = email;
		user.password = this.helper.encodePassword(password);

		return this.repository.save(user);
	}

	/**
	 * Generate a JWT Token for the Authentificated user if mail is found and password is correct.
	 * @param {LoginDto} body A class containing email and password.
	 * @returns A JWT Token in string format or an exception is thrown.
	 */
	public async login(body: LoginDto): Promise<string | never> {
		const { email, password }: LoginDto = body;
		const user: User = await this.repository.findOne({ where: { email } });

		if (!user) {
			throw new HttpException('No user found', HttpStatus.NOT_FOUND);
		}

		const isPasswordValid: boolean = this.helper.isPasswordValid(password, user.password);

		if (!isPasswordValid) {
			throw new HttpException('No user found', HttpStatus.NOT_FOUND);
		}

		this.repository.update(user.id, { lastLoginAt: new Date() });

		return this.helper.generateToken(user);
	}

	/**
	 * Generate a new JTW Token for User after updating their last login using query.
	 * @param {User} user 
	 * @returns The newly generated JWT Token.
	 */
	public async refresh(user: User): Promise<string> {
		this.repository.update(user.id, { lastLoginAt: new Date() });

		return this.helper.generateToken(user);
	}
}