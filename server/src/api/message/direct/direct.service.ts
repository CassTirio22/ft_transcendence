import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateDirectDto } from "./direct.dto";
import { Request } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "@/api/user/user.entity";
import { Repository } from "typeorm";
import { Direct } from "./direct.entity";

@Injectable()
export class DirectService {
	constructor(
		@InjectRepository(Direct)
		private readonly directRepository: Repository<Direct>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	public async direct(directId: number, userId: number): Promise<Direct> {
		return (await this.directRepository.createQueryBuilder('direct')
			.select()
			.where("direct.id = :directId", {directId: directId})
			.andWhere(":userId IN (direct.user1Id, direct.user2Id)", {userId: userId})
			.getOne());
	}

	public async directs(userId: number): Promise <Direct[]> {
		return (await this.directRepository.createQueryBuilder('direct')
		.select()
		.where(":userId IN (direct.user1Id, direct.user2Id)", {userId: userId})
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
		return (await this.directRepository.createQueryBuilder()
			.insert()
			.values({user1: user, user2: other})
			.execute()).generatedMaps[0] as Direct;
	}
}