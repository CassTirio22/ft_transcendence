import { AuthHelper } from './auth/auth.helper';
import { Block } from './block/block.entity';
import { BlockService } from './block/block.service';
import { ChannelService } from './../message/channel/channel.service';
import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectionIsNotSetError, Repository } from 'typeorm';
import { Request } from 'express';
import { EditUserDto, CustomizeUserDto } from './user.dto';
import { User, UserStatus } from './user.entity';
import { Direct } from '../message/direct/direct.entity';
import { Channel } from '../message/channel/channel.entity';
import { DirectService } from '../message/direct/direct.service';
import { unlinkSync, writeFileSync, existsSync, exists } from 'fs';
import {extname} from 'path';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly repository: Repository<User>,
		@Inject(DirectService)
		private directService: DirectService,
		@Inject(ChannelService)
		private channelService: ChannelService,
		@Inject(BlockService)
		private blockService: BlockService,
		@Inject(AuthHelper)
		private authHelper: AuthHelper
	){}	

	public async findByName(name: string): Promise<User | never> {
		return await this.repository.createQueryBuilder()
			.select()
			.where("name = :userName", {userName: name})
			.getOne();
	}

	public async edit(body: EditUserDto, req: Request): Promise<string | never> {
		const user: User = <User>req.user;

		let duplicate: User = (await this.repository.createQueryBuilder()
			.select()
			.where("name = :pseudo", {pseudo: body.name})
			.orWhere('email = :userMail', {userMail: body.email})
			.getOne())
		if (duplicate && duplicate.id != user.id) {
			throw new HttpException("Conflict. Another user uses this name/mail.", HttpStatus.CONFLICT);
		}
		let edited: User = (await this.repository.createQueryBuilder()
			.update()
			.set( {
				name: (body.name ? body.name : user.name), 
				password: (body.password ? this.authHelper.encodePassword(body.password) : user.password),
				email: (body.email ? body.email : user.email),
				picture: (body.picture ? body.picture : user.picture)
			} )
			.where("id = :userId", {userId: user.id})
			.returning('*')
			.execute()).raw[0] as User;
		if (edited) {
			return this.authHelper.generateToken(edited);
		}
		return null;
	}

	public async profile(user: User): Promise<User | never> {
		return user;
	}

	public async otherProfile(id: number, user: User): Promise<User | never> {
		let block: Block = await this.blockService.getBlock(id, user.id);
		if (block) {
			throw new HttpException("Unauthorized. The other user blocked you.", HttpStatus.UNAUTHORIZED);
		}
		return (this.repository.createQueryBuilder()
			.select()
			.where("id = :userId", {userId: id})
			.getOne());
	}

	public async userBySocket(socket: string): Promise<User | never> {
		return (await this.repository.createQueryBuilder()
			.select()
			.where('socket = :socketId', {socketId: socket})
			.getOne());
	}

	public async userById(userId: number): Promise<User | never> {
		return (await this.repository.createQueryBuilder()
			.select()
			.where("id = :userId", {userId: userId})
			.getOne());
	}

	public async ladder(): Promise<User[] | never> {
		return (await this.repository.createQueryBuilder('user')
			.select()
			.orderBy('user.score', 'ASC')
			.getMany())
	}
	public async inGame(user: number): Promise <number | never> {
		return (await this.repository.createQueryBuilder('user')
			.update()
			.where("user.id = :userId", {userId: user})
			.set({status: UserStatus.inGame})
			.execute()
		).affected;
	}

	public async outGame(user: number): Promise <number | never> {
		return (await this.repository.createQueryBuilder('user')
			.update()
			.where("user.id = :userId", {userId: user})
			.set({status: UserStatus.online})
			.execute()
		).affected;
	}

	public async saveSocket(user: User, id: string): Promise<number | never> {
		return (await this.repository.createQueryBuilder()
			.update()
			.set({socket: id, status: UserStatus.online})
			.where("id = :userId", {userId: user.id})
			.execute()).affected;
	}

	public async deleteSocket(id: string): Promise<number | never> {
		return (await this.repository.createQueryBuilder()
			.update()
			.set({socket: null, status: UserStatus.offline})
			.where("socket = :socketId", {socketId: id})
			.execute()).affected;
	}

	public async socketInGame(id: string): Promise<number | never> {
		return (await this.repository.createQueryBuilder()
			.update()
			.set({status: UserStatus.inGame})
			.where("socket = :socketId", {socketId: id})
			.execute()).affected;
	}	
	
	public async socketOutGame(id: string): Promise<number | never> {
		return (await this.repository.createQueryBuilder()
			.update()
			.set({status: UserStatus.online})
			.where("socket = :socketId", {socketId: id})
			.execute()).affected;
	}

	public async usersDefault(): Promise<number | never>{
		return (await this.repository.createQueryBuilder()
			.update()
			.set({socket: null, status: UserStatus.offline})
			.execute()).affected;
	}

	public async discussions(user: User): Promise<(Direct | Channel)[]> {
		let discussions: (Channel | Direct)[] = await this.channelService.myChannels(user.id);
		discussions = discussions.concat(await this.directService.directs(user));
		return (discussions.sort( (A, B) => (new Date(A.date)).getTime() - (new Date(B.date)).getTime() ));
	}

	public async uploadPicture(picture: any, req: Request): Promise<number> {
		const user: User = <User>req.user;
		const ext: string = extname(picture.originalname);
		const filePath = this.fileName(user, ext);
		if (user.picture && existsSync(user.picture)) {
			unlinkSync(user.picture);
		}
		writeFileSync(`${process.cwd()}`+filePath, picture.buffer);
		return (await this.repository.createQueryBuilder()
			.update()
			.where("id = :userId", {userId: user.id})
			.set({picture: filePath})
			.execute()).affected;
	}

	public async getPicture(user: User): Promise<string | null> {
		return `${process.cwd()}`+(await this.repository.createQueryBuilder()
			.select()
			.where("id = :userId", {userId: user.id})
			.getOne()).picture;
	}

	public async deletePicture(req: Request) {
		const user: User = <User>req.user;
		if (user.picture && existsSync(user.picture)) {
			unlinkSync(user.picture);
		}
		return (await this.repository.createQueryBuilder()
			.update()
			.where("id = :userId", {userId: user.id})
			.set({picture: null})
			.execute()).affected;
	}

	public async customize(body: CustomizeUserDto, user: User) : Promise<number | never> {
		return (await this.repository.createQueryBuilder()
			.update()
			.where("id = :userId", {userId: user.id})
			.set({
				coins: body.coins,
				custom: body.custom
			})
			.execute()).affected;
	}

	/* UTILS, PUT SOMEWHERE ELSE WHEN REFACTORING */

	public fileName(user: User, ext: any) {
		return `/uploads/pictures/profile_${user.id}${ext}`;
	}
}