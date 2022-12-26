import { FriendshipService } from './../../user/friendship/friendship.service';
import { Friendship } from './../../user/friendship/friendship.entity';
import { Block } from './../../user/block/block.entity';
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { CreateDirectDto } from "./direct.dto";
import { Request } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "@/api/user/user.entity";
import { EntityManager, QueryBuilder, Repository } from "typeorm";
import { Direct } from "./direct.entity";
import { BlockService } from '@/api/user/block/block.service';

@Injectable()
export class DirectService {
	constructor(
		@InjectRepository(Direct)
		private readonly directRepository: Repository<Direct>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@Inject(BlockService)
		private blockService: BlockService,
		@Inject(FriendshipService)
		private friendshipService: FriendshipService
	) {}

	public async directs(user: User): Promise <Direct[]> {
		let blocked: number[] = (await this.blockService.getBlockedList(user)).map( (obj) => (obj.id) );
		let query: any = this.directRepository.createQueryBuilder('direct')
			.select()
			.where(":userId IN (direct.user1_id, direct.user2_id)", {userId: user.id});
		if (blocked.length > 0) {
			query = query
			.andWhere("direct.user1 NOT IN (:...blockList_1)", {blockList_1: blocked})
			.andWhere("direct.user2 NOT IN (:...blockList_2)", {blockList_2: blocked})
		}
		return (await query.getMany());
	}

	public async updateDate(channelId: number, userId: number): Promise<Direct | never> {
		let direct: Direct[] = (await this.directRepository.createQueryBuilder('direct')
			.update()
			.where("id = :channelId", {channelId: channelId})
			// .andWhere(":userId IN (user1_id, user2_id)", {userId: userId})
			.set({date: () => 'NOW()'})
			.returning('*')
			.execute()).raw;
		if (direct.length == 0) {
			return null;
		}
		return direct[0];
	}

	//maybe check if blocked
	public async create(body: CreateDirectDto, req: Request): Promise<Direct> {
		const user: User = <User>req.user;
		const { id }: CreateDirectDto = body;

		let other: User = await this.userRepository.createQueryBuilder('user')
			.leftJoinAndSelect("user.direct1", "direct1", "direct1.user2 = :user_2_id", {user_2_id: user.id})
			.leftJoinAndSelect("user.direct2", "direct2", "direct2.user1 = :user_1_id", {user_1_id: user.id})
			.select()
			.where("user.id = :userId", {userId: id})
			.getOne();
		let friendship: Friendship = await this.friendshipService.friend(user, id);
		if (!other) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		else if (!friendship || other.direct1.length > 0 || other.direct2.length > 0) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		await this._checkEitherBlocked(user.id, other.id);
		return (await this.directRepository.createQueryBuilder()
			.insert()
			.values({user1: user, user2: other})
			.execute()).generatedMaps[0] as Direct;
	}


	/* PRIVATE UTILS -- PUT SOMEWHERE ELSE FOR CLEAN ARCHITECTURE*/

	private async _checkEitherBlocked(user1: number, user2: number): Promise<void> {
		let block: Block = await this.blockService.getEitherBlock(user1, user2);
		if (block) {
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		}
	}
}