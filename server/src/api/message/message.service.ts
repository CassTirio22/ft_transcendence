import{ Channel } from './channel/channel.entity'
import { Direct } from './direct/direct.entity';
import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { Repository } from "typeorm";
import { User } from "../user/user.entity";
import { SendDto, MessagesDto } from "./message.dto";
import { Message } from "./message.entity";
import { disconnect } from 'process';

@Injectable()
export class MessageService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository : Repository<User>,
		@InjectRepository(Message)
		private readonly messageRepository: Repository<Message>,
		@InjectRepository(Direct)
		private readonly directRepository: Repository<Direct>,
		@InjectRepository(Channel)
		private readonly channelRepository: Repository<Channel>
	){}

	//will not be able if blocked or muted
	public async send(body: SendDto, req: Request): Promise <Message> {
		const user: User = <User>req.user;
		const { content, origin, isDirect }: SendDto = body;

		let discussion: Direct | Channel = isDirect ? 
			(await this._direct(origin, user.id)) : 
			(await this._channel(origin, user.id));
		if (!discussion) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND)
		}
		return (await this.messageRepository.createQueryBuilder()
			.insert()
			.values({
				content: content,
				author: user ,
				direct: isDirect ? discussion as Direct : null,
				channel: isDirect ? null : discussion as Channel
			})
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

	private async _direct(directId: number, userId: number) {
		return (await this.directRepository.createQueryBuilder('direct')
			.select()
			.where("direct.id = :directId", {directId: directId})
			.andWhere(":userId IN (direct.user1Id, direct.user2Id)", {userId: userId})
			.getOne());
	}

	private async _channel(channelId: number, userId: number) {
		return (await this.channelRepository.createQueryBuilder('channel')
			.select()
			.innerJoin("channel.members", "members", "members.id = :userId", {userId: userId})
			.where("channel.id = :channelId", {channelId: channelId})
			.getOne());
	}
}