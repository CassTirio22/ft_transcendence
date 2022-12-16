import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { Repository } from "typeorm";
import { User } from "../user/user.entity";
import { SendDto } from "./message.dto";
import { Message } from "./message.entity";

@Injectable()
export class MessageService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository : Repository<User>,
		@InjectRepository(Message)
		private readonly messageRepository: Repository<Message>
	){}

	//create message
	public async send(body: SendDto, req: Request): Promise <Message> {
		const user: User = <User>req.user;
		const { content }: SendDto = body;

		return (await this.messageRepository.createQueryBuilder()
			.insert()
			.values({content: content, author: user})
			.execute()).generatedMaps[0] as Message;
	}

	//get all the conversation
	// getMessages(req: Request) {
	// 	const user: User = <User>req.user;


	// }
}