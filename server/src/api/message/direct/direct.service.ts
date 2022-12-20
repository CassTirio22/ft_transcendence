import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { DirectDto } from "./direct.dto";
import { Request } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "@/api/user/user.entity";
import { Repository } from "typeorm";
import { Direct } from "./direct.entity";

@Injectable()
export class DirectService {
	constructor(
		@InjectRepository(Direct)
		private directRepository: Repository<Direct>
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

	// public async create(body: DirectDto, req: Request): Promise<Direct> {
	// 	const user1: User = <User>req.user;
		
	// 	//vérifier que le userid existe
	// 		//Not found()
	// 	const user2: User = await this.userRepository.findOne({where: {id: body.user2}})
	// 	if (!user2)
	// 	{
	// 		throw new HttpException('Not found', HttpStatus.NOT_FOUND);
	// 	}

	// 	//vérifier que la relation n'existe pas
	// 		//Conflict
	// 	let direct: Direct = await this.directRepository.findOne({where: [
	// 		{ user1: {id: user1.id}, user2: {id: user2.id}},
	// 		{ user1: {id: user2.id}, user2: {id: user1.id}},
	// 	]})
	// 	if (direct)
	// 	{
	// 		throw new HttpException('Conflict', HttpStatus.CONFLICT);
	// 	}

	// 	direct = new Direct();
	// 	direct.user1 = user1;
	// 	direct.user2 = user2;
	// 	return this.directRepository.save(direct); // retourné le direct créé
		
	// }

	// public async getAllDirect( user: User): Promise<Direct[]> {

	// 	const listdirect: Direct[] = await this.directRepository.find(
	// 		{
	// 			where:[
	// 				{user1: {id: user.id}},
	// 				{user2: {id: user.id}}
	// 			]
	// 		}
	// 	)
	// 	return listdirect;
	// }
}