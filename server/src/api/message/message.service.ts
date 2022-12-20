import { Channel } from './channel/channel.entity'
import { Direct } from './direct/direct.entity';
import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { Repository } from "typeorm";
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
		@InjectRepository(User)
		private readonly userRepository : Repository<User>,
		@InjectRepository(Message)
		private readonly messageRepository: Repository<Message>,
		@InjectRepository(Direct)
		private readonly directRepository: Repository<Direct>,
		@InjectRepository(Channel)
		private readonly channelRepository: Repository<Channel>
	){}
	
	//should update channel date
	//will not be able if blocked or not friend
	public async sendDirect(body: SendDto, req: Request): Promise <Message> {
		const user: User = <User>req.user;
		const { content, origin }: SendDto = body;
		
		let settings: MessageSettings = {
			author: user,
			content: content,
			origin: (await this._direct(origin, user.id))};
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
			origin: (await this._channel(origin, user.id))};
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

	//should not give direct with blocked users
	public async discussions(req: Request): Promise<(Direct | Channel)[]> {
		const user: User = <User>req.user;

		let discussions: (Channel | Direct)[] = await this._channels(user.id);
		discussions = discussions.concat(await this._directs(user.id));
		return (discussions.sort( (A, B) => A.date.getTime() - B.date.getTime()));
	}

	private async _direct(directId: number, userId: number): Promise<Direct> {
		return (await this.directRepository.createQueryBuilder('direct')
			.select()
			.where("direct.id = :directId", {directId: directId})
			.andWhere(":userId IN (direct.user1Id, direct.user2Id)", {userId: userId})
			.getOne());
	}

	private async _directs(userId: number): Promise <Direct[]> {
		return (await this.directRepository.createQueryBuilder('direct')
		.select()
		.where(":userId IN (direct.user1Id, direct.user2Id)", {userId: userId})
		.getMany());
	}

	private async _channel(channelId: number, userId: number): Promise<Channel> {
		return (await this.channelRepository.createQueryBuilder('channel')
			.select()
			.innerJoin("channel.members", "members", "members.user_id = :userId", {userId: userId})
			.where("channel.id = :channelId", {channelId: channelId})
			.getOne());
	}

	private async _channels(userId: number): Promise<Channel[]> {
		return ( await this.channelRepository.createQueryBuilder('channel')
			.select()
			.innerJoin("channel.members", "members", "members.user_id = :memberId", {memberId: userId})
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