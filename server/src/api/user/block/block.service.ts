import { HttpException, HttpStatus, Injectable, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { User } from "../user.entity";
import { BlockDto, DeleteBlockDto } from "./block.dto";
import { Block } from "./block.entity";
import { Request } from 'express';

@Injectable({})
export class BlockService {
	constructor(
		@InjectRepository(Block)
		private blockRepository: Repository<Block>,
		@InjectRepository(User)
		private userRepository: Repository<User>
	){}

	public async block(body: BlockDto, req: Request): Promise<Block> {
		const user: User = <User>req.user;
		const { id }: BlockDto = body;

		let blockedUser: User = (await this.userRepository.createQueryBuilder('user')
			.select()
			.leftJoinAndSelect("user.blockTo", "blockTo", "blockTo.blocker = :blockerId", {blockerId: user.id} )
			.where("id = :blockedId", {blockedId: id})
			.getOne());
		if (!blockedUser) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		else if (user.id == id || blockedUser.blockTo.length > 0) {
			throw new HttpException("Conflict", HttpStatus.CONFLICT);
		}
		return (await this.blockRepository.createQueryBuilder()
			.insert()
			.values({blocker: user, blocked: blockedUser})
			.execute()).generatedMaps[0] as Block;
	}

	public async getBlock(user: number, other: number): Promise<Block | never> {
		return (await this.blockRepository.createQueryBuilder('block')
			.select()
			.where("blocker_id = :userId", {userId: user})
			.andWhere("blocked_id = :otherId", {otherId: other})
			.getOne());
	}

	public async getEitherBlock(user1: number, user2: number): Promise<Block | never> {
		return (await this.blockRepository.createQueryBuilder('block')
			.select()
			.where("block.blocker_id IN (:...usersId)", {usersId: [user1, user2]})
			.andWhere("block.blocked_id IN (:...othersId)", {othersId: [user1, user2]})
			.getOne());
	}

	public async getBlockedList(user: User): Promise<User[]> {
		return (await this.userRepository.createQueryBuilder('user')
			.innerJoin("user.blockTo", "blockTo","blockTo.blocker = :blockerId", {blockerId: user.id} )
			.select()
			.getMany());
	}

	public async getBlockerList(user: User): Promise<User[]> {
		return (await this.userRepository.createQueryBuilder('user')
			.innerJoin("user.blockedBy", "blockedBy","blockedBy.blocked = :blockedId", {blockedId: user.id} )
			.select()
			.getMany());
	}

	public async getEitherBlockedList(user: User): Promise<User[]> {
		return (await this.userRepository.createQueryBuilder('user')
			.leftJoinAndSelect("user.blockTo", "blockTo")
			.leftJoinAndSelect("user.blockedBy", "blockedBy")
			.select()
			.where("blockTo.blocker = :blockerId", {blockerId: user.id})
			.orWhere("blockedBy.blocked = :blockedId", {blockedId: user.id})
			.getMany());
	}

	public async deleteBlock(body: DeleteBlockDto, req: Request): Promise<number> 
	{
		const user: User = <User>req.user;
		const { id }: DeleteBlockDto = body;

		if (user.id == id) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		return (await this.blockRepository.createQueryBuilder()
			.delete()
			.where("blocker = :blockerId", {blockerId: user.id})
			.andWhere("blocked = :blockedId", {blockedId: id})
			.execute()).affected;
	}
}