import { Message } from './../message.entity';
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
		private friendshipService: FriendshipService,
		@InjectRepository(Message)
		private messageRepository: Repository<Message>
	) {}

	public async directs(user: User): Promise <Direct[]> {
		let blocked: number[] = (await this.blockService.getEitherBlockedList(user)).map( (obj) => (obj.id) );
		let query: any = this.directRepository.createQueryBuilder('direct')
			.leftJoinAndSelect("direct.messages", "messages")
			.leftJoinAndSelect("direct.user1", "user1")
			.leftJoinAndSelect("direct.user2", "user2")
			.leftJoin("direct.messages", "next_messages", "messages.date < next_messages.date")
			.select()
			.where("next_messages.id IS NULL")
			.andWhere(":userId IN (direct.user1_id, direct.user2_id)", {userId: user.id});
		if (blocked.length > 0) {
			query = query
			.andWhere("direct.user1 NOT IN (:...blockList_1)", {blockList_1: blocked})
			.andWhere("direct.user2 NOT IN (:...blockList_2)", {blockList_2: blocked})
		}
		return (await query.getMany());
	}

	public async updateDate(directId: number, userId: number): Promise<Direct | never> {
		let direct: Direct[] = (await this.directRepository.createQueryBuilder('direct')
			.update()
			.where("id = :directId", {directId: directId})
			.andWhere(":userId IN (user1_id, user2_id)", {userId: userId})
			.set({date: () => 'NOW()'})
			.returning('*')
			.execute()).raw;
		return (direct.length == 0 ? null : direct[0]);
	}

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
			throw new HttpException('Not found. There is no user found with those criterias.', HttpStatus.NOT_FOUND);
		}
		else if (!friendship) {
			throw new HttpException('Unauthorized. You are not friend with this user.', HttpStatus.UNAUTHORIZED);
		}
		else if (other.direct1.length > 0 || other.direct2.length > 0) {
			throw new HttpException('Conflict. This direct already exists.', HttpStatus.CONFLICT);
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
			throw new HttpException('Unauthorized. You have blocked this user OR this user blocked you.', HttpStatus.UNAUTHORIZED);
		}
	}
}