import { HttpException, HttpStatus, Injectable, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { User } from "../user.entity";
import { BlockDto, DeleteBlockDto } from "./block.dto";
import { Block } from "./block.entity";
import { Request } from 'express';
import { NOTFOUND } from "dns";

@Injectable({})
export class BlockService {
	constructor(
		@InjectRepository(Block)
		private blockRepository: Repository<Block>,
		@InjectRepository(User)
		private userRepository: Repository<User>
	){}

	public async block(body: BlockDto, req: Request): Promise<Block>
	{
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

	public async getBlocked(user: User): Promise<User[]> 
	{
		return (await this.userRepository.createQueryBuilder('user')
			.innerJoin("user.blockTo", "blockTo","blockTo.blocker = :blockerId", {blockerId: user.id} )
			.select()
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