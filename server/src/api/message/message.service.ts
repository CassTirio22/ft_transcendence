import { FriendshipService } from './../user/friendship/friendship.service';
import { Friendship } from './../user/friendship/friendship.entity';
import { MemberService } from './channel/member/member.service';
import { Member, MemberLevel, MemberStatus } from './channel/member/member.entity';
import { DirectService } from './direct/direct.service';
import { ChannelService } from './channel/channel.service';
import { Channel } from './channel/channel.entity'
import { Direct } from './direct/direct.entity';
import { Inject, Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { Repository } from "typeorm";
import { User } from "../user/user.entity";
import { SendDto, MessagesDto } from "./message.dto";
import { Message } from "./message.entity";
import { BlockService } from '../user/block/block.service';
import { Block } from '../user/block/block.entity';

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
		private directService: DirectService,
		@Inject(MemberService)
		private memberService: MemberService,
		@Inject(BlockService)
		private blockService: BlockService,
		@Inject(FriendshipService)
		private friendshipService: FriendshipService,
	){}
	
	public async sendDirect(body: SendDto, req: Request): Promise <Message> {
		const user: User = <User>req.user;
		const { content, origin }: SendDto = body;
		
		let settings: MessageSettings = {
			author: user,
			content: content,
			origin: (await this.directService.updateDate(origin, user.id)
		)};
		let other: number = (user ==  (<Direct>settings.origin).user1) ? (<Direct>settings.origin).user2.id : user.id;
		let friendship: Friendship = await this.friendshipService.friend(user, other);
		if (!settings.origin) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND);
		}
		else if (!friendship) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
		await this._checkUserBlocked(user, other);
		return this._insert(settings);
	}

	public async sendChannel(body: SendDto, req: Request): Promise <Message> {
		const user: User = <User>req.user;
		const { content, origin }: SendDto = body;

		await this._checkMemberStatus(origin, user, [MemberStatus.regular]);
		let settings: MessageSettings = {
			author: user,
			content: content,
			origin: (await this.channelService.updateDate(origin, user.id))};
		if (!settings.origin) {
			throw new HttpException('Not found', HttpStatus.NOT_FOUND)
		}
		return this._insert(settings);
	}

	public async directMessages(body: MessagesDto, req: Request): Promise<Message[]> {
		const user: User = <User>req.user;
		const { origin }: MessagesDto = body;

		let blocked: User[] = await this.blockService.getBlockedList(user);
		return (await this.messageRepository.createQueryBuilder('message')
			.innerJoin("message.direct", "direct", "direct.id = :directId AND :userId IN (direct.user1Id, direct.user2Id)", {directId: origin, userId: user.id})
			.select()
			.where("message.author NOT IN (:...blockedList)", {blockedList: blocked})
			.getMany());
	}

	public async channelMessages(body: MessagesDto, req: Request): Promise<Message[]> {
		const user: User = <User>req.user;
		const { origin }: MessagesDto = body;

		let blocked: User[] = await this.blockService.getBlockedList(user);
		return (await this.messageRepository.createQueryBuilder('message')
			.innerJoin("message.channel", "channel", "channel.id = :channelId", {channelId: origin})
			.innerJoin("channel.members", "members", "members.user_id = :userId", {userId: user.id})
			.select()
			.where("members.user_id NOT IN (:...blockedList)", {blockedList: blocked})
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


	/* PRIVATE UTILS -- PUT SOMEWHERE ELSE FOR CLEAN ARCHITECTURE*/

	private async _checkMemberStatus(channel: number, user: User, authorized: MemberStatus[]): Promise<void> {
		let member: Member =  await this.memberService.member({channel: channel}, user);
		if (!authorized.find(element => member.status == element)) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT)
		}
	}

	private async _checkUserBlocked(user: User, other: number): Promise<void> {
		let block: Block = await this.blockService.getBlock(user,other);
		if (block) {
			throw new HttpException('Conflict', HttpStatus.CONFLICT);
		}
	}
}