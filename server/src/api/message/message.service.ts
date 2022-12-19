import { Direct } from './direct/direct.entity';
import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { Repository } from "typeorm";
import { User } from "../user/user.entity";
import { SendDto, MessagesDto } from "./message.dto";
import { Message } from "./message.entity";

@Injectable()
export class MessageService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository : Repository<User>,
		@InjectRepository(Message)
		private readonly messageRepository: Repository<Message>,
		@InjectRepository(Direct)
		private readonly directRepository: Repository<Direct>
	){}

	//will not be able if blocked or muted
	public async send(body: SendDto, req: Request): Promise <Message> {
		const user: User = <User>req.user;
		const { content, origin }: SendDto = body;

		let discussion: Direct = await this.directRepository.createQueryBuilder('direct')
			.select()
			.where("direct.id = :directId", {directId: origin})
			.andWhere(":userId IN (direct.user1Id, direct.user2Id)", {userId: user.id})
			.getOne();
		if (!discussion) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND)
		}
		return (await this.messageRepository.createQueryBuilder()
			.insert()
			.values({content: content, author: user , direct: discussion})
			.execute()).generatedMaps[0] as Message;
	}

	//will need to select only non muted messages
	public async getMessages(body: MessagesDto, req: Request): Promise<Message[]> {
		const user: User = <User>req.user;
		const { origin }: MessagesDto = body;

		return (await this.messageRepository.createQueryBuilder('message')
			.innerJoin("message.direct", "direct", "direct.id = :directId AND :userId IN (direct.user1Id, direct.user2Id)", {directId: origin, userId: user.id})
			.select()
			.getMany());
	}
}