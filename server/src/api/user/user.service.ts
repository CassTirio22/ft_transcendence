import { ChannelService } from './../message/channel/channel.service';
import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { UpdateNameDto } from './user.dto';
import { User } from './user.entity';
import { Direct } from '../message/direct/direct.entity';
import { Channel } from '../message/channel/channel.entity';
import { DirectService } from '../message/direct/direct.service';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly repository: Repository<User>,
		@Inject(DirectService)
		private directService: DirectService,
		@Inject(ChannelService)
		private channelService: ChannelService,
	){}	

	public async updateName(body: UpdateNameDto, req: Request): Promise<number> {
		const user: User = <User>req.user;

		let duplicate: User = (await this.repository.createQueryBuilder()
			.select()
			.where("name = :pseudo", {pseudo: body.name})
			.getOne())
		if (duplicate) {
			throw new HttpException("Conflict", HttpStatus.CONFLICT);
		}
		return (await this.repository.createQueryBuilder()
			.update()
			.set( { name: body.name } )
			.where("id = :userId", {userId: user.id})
			.execute()).affected;
	}

	public async profile(user: User): Promise<User | never> {
		return user;
	}

  	//should not give direct with blocked users
	public async discussions(req: Request): Promise<(Direct | Channel)[]> {
		const user: User = <User>req.user;

		let discussions: (Channel | Direct)[] = await this.channelService.channels(user.id);
		discussions = discussions.concat(await this.directService.directs(user.id));
		return (discussions.sort( (A, B) => (new Date(A.date)).getTime() - (new Date(B.date)).getTime()));
	}
}