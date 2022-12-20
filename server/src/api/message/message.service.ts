import { DirectService } from './direct/direct.service';
import { ChannelService } from './channel/channel.service';
import { Channel } from './channel/channel.entity'
import { Direct } from './direct/direct.entity';
import { Inject, Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { In, Repository } from "typeorm";
import { User } from "../user/user.entity";
import { SendDto, MessagesDto } from "./message.dto";
import { Message } from "./message.entity";
import { disconnect } from 'process';

interface MessageSettings {
	author:		User;
	origin:		Channel | Direct;
	content:	string;
}

@Injectable()
export class MessageService {
	constructor(
		@InjectRepository(Message)
		private readonly messageRepository: Repository<Message>,
		@Inject(ChannelService)
		private channelService: ChannelService,
		@Inject(DirectService)
		private directService: DirectService
	){}
	
	//should update channel date
	//will not be able if blocked or not friend
	public async sendDirect(body: SendDto, req: Request): Promise <Message> {
		const user: User = <User>req.user;
		const { content, origin }: SendDto = body;
		
		let settings: MessageSettings = {
			author: user,
			content: content,
			origin: (await this.directService.updateDate(origin, user.id))};
		if (!settings.origin) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND)
		}
		return this._insert(settings);
	}

	//should update channel date
	//will not be able if blocked or muted
	public async sendChannel(body: SendDto, req: Request): Promise <Message> {
		const user: User = <User>req.user;
		const { content, origin }: SendDto = body;

		let settings: MessageSettings = {
			author: user,
			content: content,
			origin: (await this.channelService.updateDate(origin, user.id))};
		if (!settings.origin) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND)
		}
		return this._insert(settings);
	}

	//will need to select only non blocked messages
	public async directMessages(body: MessagesDto, req: Request): Promise<Message[]> {
		const user: User = <User>req.user;
		const { origin }: MessagesDto = body;

		return (await this.messageRepository.createQueryBuilder('message')
			.innerJoin("message.direct", "direct", "direct.id = :directId AND :userId IN (direct.user1Id, direct.user2Id)", {directId: origin, userId: user.id})
			.select()
			.getMany());
	}

	//will need to select only non blocked messages
	public async channelMessages(body: MessagesDto, req: Request): Promise<Message[]> {
		const user: User = <User>req.user;
		const { origin }: MessagesDto = body;

		return (await this.messageRepository.createQueryBuilder('message')
			.innerJoin("message.channel", "channel", "channel.id = :channelId", {channelId: origin})
			.innerJoin("channel.members", "members", "members.user_id = :userId", {userId: user.id})
			.select()
			.getMany());
	}

	private async _insert(settings: MessageSettings): Promise<Message> {
		return (await this.messageRepository.createQueryBuilder()
		.insert()
		.values({
			content: settings.content,
			author: settings.author ,
			direct: settings.origin instanceof Direct ? settings.origin : null,
			channel: settings.origin instanceof Channel ? settings.origin : null
		})
		.execute()).generatedMaps[0] as Message;
	}
}