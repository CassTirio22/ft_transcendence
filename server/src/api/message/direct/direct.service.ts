import { Block } from './../../user/block/block.entity';
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { CreateDirectDto } from "./direct.dto";
import { Request } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "@/api/user/user.entity";
import { Repository } from "typeorm";
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
		private blockService: BlockService
	) {}

	public async directs(user: User): Promise <Direct[]> {
		let blocked: User[] = await this.blockService.getBlockedList(user);
		return (await this.directRepository.createQueryBuilder('direct')
			.select()
			.where(":userId IN (direct.user1Id, direct.user2Id)", {userId: user.id})
			.andWhere("direct.user1Id NOT IN (:...blockList_1)", {blockList_1: blocked})
			.andWhere("direct.user2Id NOT IN (:...blockList_2)", {blockList_1: blocked})
			.getMany());
	}

	public async updateDate(channelId: number, userId: number): Promise<Direct> {
		return (await this.directRepository.createQueryBuilder('direct')
			.update()
			.where("id = :channelId", {channelId: channelId})
			.andWhere(":userId IN (user1Id, user2Id)", {userId: userId})
			.set({date: () => 'NOW()'})
			.returning('*')
			.execute()).raw as Direct;
	}

	public async create(body: CreateDirectDto, req: Request): Promise<Direct> {
		const user: User = <User>req.user;
		const { id }: CreateDirectDto = body;

		let other: User = await this.userRepository.createQueryBuilder('user')
			.leftJoinAndSelect("user.direct1", "direct1", "direct1.user2 = :user2Id", {user2Id: user.id})
			.leftJoinAndSelect("user.direct2", "direct2", "direct2.user1 = :user1Id", {user1Id: user.id})
			.select()
			.where("user.id = :userId", {userId: id})
			.getOne()
		if (!other) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND)
		}
		else if (other.direct1.length > 0 || other.direct2.length > 0) {
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
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
	}
}