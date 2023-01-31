import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/api/user/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto, LoginDto, IntraRegisterDto, TwoFaDto, PhoneNumberId } from './auth.dto';
import { AuthHelper } from './auth.helper';
import axios from 'axios';

/**
 * This class will manage the logic behind our endpoints.
 * Documentation about endpoints : https://docs.nestjs.com/controllers
 */

function makeid(length: number) {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}


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
		const { name, email, password, intraAuth }: RegisterDto = body;
		let user: User = await this.repository.findOne({ where: [{ email }, { name }] });

		if (user) {
			throw new HttpException('Conflict. Another user already use this email/name.', HttpStatus.CONFLICT);
		}

		user = new User();

		user.name = name;
		user.email = email;
		user.password = this.helper.encodePassword(password);
		user.intraAuth = intraAuth;

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

		if (user.intraAuth) {
			return ""
		} else if (user.phone && !body.code) {
			const code = makeid(6);
			this.repository.update(user.id, { phoneCode: code });
			const ret = await axios({
				method: "post",
				url: "https://api.smsdispatcher.app/api/text-messages",
				data: {
					phone_number: user.phone,
					message: `Your verification code is: ${code}`
				},
				headers: {
					"Authorization": `Bearer ${"eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ImFlMjQ1YjUyLWMyYjctNDg0ZS05ZmExLWRmNTY2YjFhMTZkZSJ9.mKm7FosdC87wC0ZwvS63214XDr7-DKgezqbrUchmGnE"}`
				}
			})
			.then(e => e.data)
			.catch(e => null)
			return "2fa"
		} else if (user.phone && body.code && body.code != user.phoneCode) {
			console.log(body.code, user.phoneCode)
			return "2fa-invalid"
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

	public async createUser(body: IntraRegisterDto): Promise<string | never> {
		let user: User = await this.repository.createQueryBuilder()
			.select()
			.where("name = :userName", {userName: body.name})
			.orWhere("email = :userMail", {userMail: body.email})
			.getOne();
		if (!user || user == undefined) {
			user = (await this.repository.createQueryBuilder()
				.insert()
				.values({
					name: body.name,
					picture: body.picture,
					email: body.email,
					intraAuth: true,
					password: "coucou"
				})
				.execute()).generatedMaps[0] as User;
			return this.helper.generateToken(user);
		}
		if (!user.intraAuth)
			return "";
		return this.helper.generateToken(user); 
	}

	public async update2fa(phone_id: PhoneNumberId): Promise<string | never> {
		let edited: User = (await this.repository.createQueryBuilder()
			.update()
			.set( {
				phone: phone_id.phone == "" ? null : phone_id.phone
			} )
			.where("id = :userId", {userId: phone_id.id})
			.returning('*')
			.execute()).raw[0] as User;
		return edited.phoneCode;
	}

	public async updatePhoneCode(user_id: number): Promise<string | never> {
		let edited: User = (await this.repository.createQueryBuilder()
			.update()
			.set( {
				phoneCode: makeid(6)
			} )
			.where("id = :userId", {userId: user_id})
			.returning('*')
			.execute()).raw[0] as User;
		return edited.phoneCode;
	}
}