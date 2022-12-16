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

	public async send(body: SendDto, req: Request): Promise <Message> {
		const user: User = <User>req.user;
		const { content, origin }: SendDto = body;

		let discussion: Direct = await this.directRepository.createQueryBuilder()
			.select()
			.where("id = :directId", {directId: origin})
			.getOne();
		if (!discussion) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND)
		}
		return (await this.messageRepository.createQueryBuilder()
			.insert()
			.values({content: content, author: user , direct: discussion})
			.execute()).generatedMaps[0] as Message;
	}

	public async getMessages(body: MessagesDto): Promise<Message[]> {
		const { origin }: MessagesDto = body;

		return (await this.messageRepository().createQueryBuilder()
			.innerJoind("")
			.select()
			.where("")
			.getMany());
	}
}